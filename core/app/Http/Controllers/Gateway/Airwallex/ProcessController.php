<?php

namespace App\Http\Controllers\Gateway\Airwallex;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Gateway\PaymentController;
use App\Lib\CurlRequest;
use App\Models\Deposit;
use Illuminate\Http\Request;

class ProcessController extends Controller
{
    /**
     * Initiate the Airwallex payment by creating a payment intent and
     * returning a redirect to the Airwallex-hosted checkout page.
     */
    public static function process($deposit)
    {
        $credentials = json_decode($deposit->gatewayCurrency()->gateway_parameter);

        if (empty($credentials->client_id) || empty($credentials->api_key)) {
            $send['error']   = true;
            $send['message'] = 'Airwallex gateway is not configured properly. Please complete the client ID and API key.';
            return json_encode($send);
        }

        $controller = new static();
        $token      = $controller->getAccessToken($credentials);

        if (!$token) {
            $send['error']   = true;
            $send['message'] = 'Unable to authenticate with Airwallex. Please verify your credentials.';
            return json_encode($send);
        }

        $callbackRoute = $deposit->agent_id
            ? route('agent.deposit.airwallex.callback', ['trx' => $deposit->trx])
            : route('user.deposit.airwallex.callback', ['trx' => $deposit->trx]);

        $intent = $controller->createPaymentIntent($credentials, $deposit, $token, $callbackRoute);

        if (!$intent) {
            $send['error']   = true;
            $send['message'] = 'Unable to create Airwallex payment intent. Please verify gateway configuration.';
            return json_encode($send);
        }

        $checkoutUrl = $controller->buildCheckoutUrl($intent, $deposit, $callbackRoute);

        $send['redirect']     = true;
        $send['redirect_url'] = $checkoutUrl;
        return json_encode($send);
    }

    /**
     * Called when Airwallex redirects the user back after checkout.
     */
    public function callback(Request $request, string $trx)
    {
        $deposit = Deposit::where('trx', $trx)->orderBy('id', 'DESC')->firstOrFail();

        if ($deposit->status == Status::PAYMENT_SUCCESS) {
            return redirect($deposit->success_url);
        }

        $credentials = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $token       = $this->getAccessToken($credentials);

        if (!$token) {
            $notify[] = ['error', 'Unable to verify Airwallex payment status.'];
            return redirect($deposit->failed_url)->withNotify($notify);
        }

        $intentId = $request->query('payment_intent_id') ?? $deposit->btc_wallet;

        if (!$intentId) {
            $notify[] = ['error', 'Payment intent reference not found.'];
            return redirect($deposit->failed_url)->withNotify($notify);
        }

        $status = $this->getPaymentIntentStatus($credentials, $token, $intentId);

        if (in_array($status, ['SUCCEEDED', 'REQUIRES_CAPTURE'], true)) {
            PaymentController::userDataUpdate($deposit);
            $notify[] = ['success', 'Payment completed successfully'];
            return redirect($deposit->success_url)->withNotify($notify);
        }

        $notify[] = ['error', 'Payment not completed. Status: ' . ($status ?: 'unknown') . '. Please check your deposit history or contact support.'];
        return redirect($deposit->failed_url)->withNotify($notify);
    }

    /**
     * Webhook endpoint for server-to-server Airwallex notifications.
     * Airwallex sends a POST with the payment intent event payload.
     */
    public function ipn(Request $request)
    {
        $payload = $request->all();
        $name    = $payload['name'] ?? '';

        if (!str_starts_with($name, 'payment_intent.')) {
            return response()->json(['status' => 'ignored']);
        }

        $intentData = $payload['data']['object'] ?? [];
        $intentId   = $intentData['id'] ?? null;
        $status     = $intentData['status'] ?? null;
        $reference  = $intentData['merchant_order_id'] ?? null;

        if (!$intentId || !$reference) {
            return response()->json(['status' => 'missing_data'], 400);
        }

        $deposit = Deposit::where('trx', $reference)
            ->where('status', Status::PAYMENT_INITIATE)
            ->orderBy('id', 'DESC')
            ->first();

        if (!$deposit) {
            return response()->json(['status' => 'not_found']);
        }

        if (in_array($status, ['SUCCEEDED', 'REQUIRES_CAPTURE'], true)) {
            PaymentController::userDataUpdate($deposit);
        }

        return response()->json(['status' => 'processed']);
    }

    /**
     * Authenticate with Airwallex and return a short-lived access token.
     */
    protected function getAccessToken($credentials): ?string
    {
        $baseUrl = $this->baseUrl($credentials);
        $url     = $baseUrl . '/api/v1/authentication/login';
        $headers = [
            'Content-Type: application/json',
            'x-client-id: ' . $credentials->client_id,
            'x-api-key: ' . $credentials->api_key,
        ];

        $result  = CurlRequest::curlPostContent($url, '{}', $headers);
        $decoded = json_decode($result, true);

        return $decoded['token'] ?? null;
    }

    /**
     * Create a payment intent and return the intent data (id + client_secret).
     * Also stores the intent ID on the deposit for later verification.
     */
    protected function createPaymentIntent($credentials, $deposit, string $token, string $returnUrl): ?array
    {
        $baseUrl = $this->baseUrl($credentials);
        $url     = $baseUrl . '/api/v1/pa/payment_intents/create';

        $payload = json_encode([
            'amount'            => round((float) $deposit->final_amount, 2),
            'currency'          => strtoupper($deposit->method_currency),
            'merchant_order_id' => $deposit->trx,
            'return_url'        => $returnUrl,
            'descriptor'        => 'Deposit ' . $deposit->trx,
        ]);

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ];

        $result  = CurlRequest::curlPostContent($url, $payload, $headers);
        $decoded = json_decode($result, true);

        if (empty($decoded['id'])) {
            return null;
        }

        // Persist intent ID so the callback can look it up without relying solely on query params
        $deposit->btc_wallet = $decoded['id'];
        $deposit->save();

        return $decoded;
    }

    /**
     * Build the Airwallex-hosted checkout URL from a payment intent.
     */
    protected function buildCheckoutUrl(array $intent, $deposit, string $returnUrl): string
    {
        $params = http_build_query([
            'intent_id'     => $intent['id'],
            'client_secret' => $intent['client_secret'] ?? '',
            'currency'      => strtoupper($deposit->method_currency),
            'return_url'    => $returnUrl,
            'locale'        => 'en',
        ]);

        return 'https://checkout.airwallex.com/?' . $params;
    }

    /**
     * Retrieve the current status of a payment intent.
     */
    protected function getPaymentIntentStatus($credentials, string $token, string $intentId): ?string
    {
        $baseUrl = $this->baseUrl($credentials);
        $url     = $baseUrl . '/api/v1/pa/payment_intents/' . $intentId;
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ];

        $result  = CurlRequest::curlContent($url, $headers);
        $decoded = json_decode($result, true);

        return $decoded['status'] ?? null;
    }

    /**
     * Return the correct Airwallex API base URL based on credentials.
     * Defaults to the demo/sandbox URL.
     */
    protected function baseUrl($credentials): string
    {
        $env = strtolower(trim($credentials->environment ?? 'demo'));
        if ($env === 'production') {
            return 'https://api.airwallex.com';
        }
        return 'https://api-demo.airwallex.com';
    }
}
