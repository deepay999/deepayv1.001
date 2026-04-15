<?php

namespace App\Http\Controllers\Gateway\Alipay;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Gateway\PaymentController;
use App\Lib\CurlRequest;
use App\Models\Deposit;
use App\Models\Gateway;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProcessController extends Controller
{
    public static function process($deposit)
    {
        $config = json_decode($deposit->gatewayCurrency()->gateway_parameter);

        $gatewayUrl = rtrim($config->gateway_url ?? 'https://openapi.alipay.com/gateway.do', '?');
        $bizContent = json_encode([
            'out_trade_no' => $deposit->trx,
            'product_code' => 'FAST_INSTANT_TRADE_PAY',
            'total_amount' => number_format((float) $deposit->final_amount, 2, '.', ''),
            'subject'      => 'Deposit ' . $deposit->trx,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $params = [
            'app_id'      => $config->app_id ?? '',
            'method'      => 'alipay.trade.page.pay',
            'format'      => 'JSON',
            'charset'     => 'utf-8',
            'sign_type'   => 'RSA2',
            'timestamp'   => date('Y-m-d H:i:s'),
            'version'     => '1.0',
            'notify_url'  => route('ipn.Alipay'),
            'return_url'  => route('ipn.Alipay', ['type' => 'return']),
            'biz_content' => $bizContent,
        ];

        $privateKey = self::normalizePrivateKey($config->private_key ?? '');

        $signature = '';
        if (!openssl_sign(self::buildSignString($params), $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
            logger()->error('Alipay sign failed', [
                'trx'   => $deposit->trx,
                'error' => openssl_error_string(),
            ]);
        }
        $params['sign'] = base64_encode($signature);

        $send['redirect']     = true;
        $send['redirect_url'] = $gatewayUrl . '?' . http_build_query($params);
        return json_encode($send);
    }

    public function ipn(Request $request)
    {
        // Generate trace-id for every IPN call so all log lines are correlatable
        $traceId = $request->header('X-Request-Id') ?: $request->header('X-Trace-Id') ?: (string) Str::uuid();

        $gateway = $this->gatewayConfigByAlias('Alipay');
        if (!$gateway) {
            logger()->error('Alipay IPN: gateway config not found', ['trace_id' => $traceId]);
            return response('fail')->header('Content-Type', 'text/plain');
        }

        $all         = $request->all();
        $sign        = $all['sign'] ?? '';
        $tradeNo     = $all['out_trade_no'] ?? '';
        $tradeStatus = $all['trade_status'] ?? '';
        $amount      = $all['total_amount'] ?? 0;

        if (!$tradeNo || !$sign) {
            logger()->warning('Alipay IPN: missing required fields', [
                'trace_id'    => $traceId,
                'has_trade_no' => (bool) $tradeNo,
                'has_sign'     => (bool) $sign,
            ]);
            return $this->ipnResponse($request, false);
        }

        $publicKey = self::normalizePublicKey($gateway->alipay_public_key ?? '');
        if (!$publicKey) {
            logger()->error('Alipay IPN: public key missing in gateway config', [
                'trace_id' => $traceId,
                'trx'      => $tradeNo,
            ]);
            return $this->ipnResponse($request, false);
        }

        if (!self::verify($all, $sign, $publicKey)) {
            logger()->warning('Alipay IPN: signature verification failed', [
                'trace_id'     => $traceId,
                'trx'          => $tradeNo,
                'trade_status' => $tradeStatus,
            ]);
            return $this->ipnResponse($request, false);
        }

        $deposit = Deposit::where('trx', $tradeNo)->where('status', Status::PAYMENT_INITIATE)->orderBy('id', 'DESC')->first();
        if (!$deposit) {
            // Legitimate "already processed" case — Alipay expects 'success' to stop retries
            logger()->info('Alipay IPN: deposit not found or already processed', [
                'trace_id'     => $traceId,
                'trx'          => $tradeNo,
                'trade_status' => $tradeStatus,
            ]);
            return $this->ipnResponse($request, true);
        }

        $paid          = in_array($tradeStatus, ['TRADE_SUCCESS', 'TRADE_FINISHED']);
        $amountMatched = (float) number_format((float) $amount, 2, '.', '') == (float) number_format((float) $deposit->final_amount, 2, '.', '');

        if ($paid && $amountMatched) {
            PaymentController::userDataUpdate($deposit);
            logger()->info('Alipay IPN: payment confirmed', [
                'trace_id'     => $traceId,
                'trx'          => $tradeNo,
                'trade_status' => $tradeStatus,
                'amount'       => $amount,
            ]);
            return $this->ipnResponse($request, true, $deposit);
        }

        logger()->warning('Alipay IPN: payment not completed', [
            'trace_id'      => $traceId,
            'trx'           => $tradeNo,
            'trade_status'  => $tradeStatus,
            'paid'          => $paid,
            'amount_match'  => $amountMatched,
        ]);
        return $this->ipnResponse($request, false, $deposit);
    }

    public function query()
    {
        $gateway = Gateway::where('alias', 'Alipay')->first();
        if (!$gateway) {
            return response()->json(['status' => 'error', 'message' => 'Gateway not found'], 404);
        }

        $query = Deposit::query()->initiated()
            ->where('method_code', $gateway->code)
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('last_cron');

        $checked = (clone $query)->count();
        $updated = 0;
        $query->limit(20)->get()->each(function (Deposit $deposit) use (&$updated) {
            $deposit->last_cron = time();
            $deposit->save();
            if (self::syncByDeposit($deposit)) {
                $updated++;
            }
        });

        return response()->json(['status' => 'success', 'checked' => $checked, 'updated' => $updated]);
    }

    public static function syncByDeposit(Deposit $deposit): bool
    {
        if ($deposit->status == Status::PAYMENT_SUCCESS) {
            return true;
        }

        $config     = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $gatewayUrl = rtrim($config->gateway_url ?? 'https://openapi.alipay.com/gateway.do', '?');

        $params = [
            'app_id'      => $config->app_id ?? '',
            'method'      => 'alipay.trade.query',
            'format'      => 'JSON',
            'charset'     => 'utf-8',
            'sign_type'   => 'RSA2',
            'timestamp'   => date('Y-m-d H:i:s'),
            'version'     => '1.0',
            'biz_content' => json_encode(['out_trade_no' => $deposit->trx], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];

        $privateKey = self::normalizePrivateKey($config->private_key ?? '');
        $params['sign'] = self::sign($params, $privateKey);

        $traceId  = (string) Str::uuid();
        $rawResponse = CurlRequest::curlPostContent($gatewayUrl, $params, ['Content-Type: application/x-www-form-urlencoded']);

        if (!$rawResponse) {
            logger()->error('Alipay syncByDeposit: cURL returned empty response', [
                'trace_id' => $traceId,
                'trx'      => $deposit->trx,
            ]);
            return false;
        }

        $result = json_decode($rawResponse, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            logger()->error('Alipay syncByDeposit: json_decode failed', [
                'trace_id'  => $traceId,
                'trx'       => $deposit->trx,
                'json_error' => json_last_error_msg(),
            ]);
            return false;
        }

        $payload = $result['alipay_trade_query_response'] ?? [];
        $status  = $payload['trade_status'] ?? '';
        $amount  = $payload['total_amount'] ?? ($payload['receipt_amount'] ?? null);

        $paid          = in_array($status, ['TRADE_SUCCESS', 'TRADE_FINISHED']);
        $amountMatched = $amount !== null && (float) number_format((float) $amount, 2, '.', '') == (float) number_format((float) $deposit->final_amount, 2, '.', '');

        if ($paid && $amountMatched) {
            PaymentController::userDataUpdate($deposit);
            return true;
        }

        return false;
    }

    protected function ipnResponse(Request $request, bool $ok, $deposit = null): mixed
    {
        if (($request->type ?? '') === 'return') {
            if ($ok && $deposit) {
                $notify[] = ['success', 'Payment successful'];
                return redirect($deposit->success_url)->withNotify($notify);
            }
            $notify[] = ['error', 'Payment failed'];
            return redirect($deposit->failed_url ?? route('user.deposit.history'))->withNotify($notify);
        }

        // Alipay IPN spec: respond with plain text 'success' or 'fail'
        return response($ok ? 'success' : 'fail')->header('Content-Type', 'text/plain');
    }

    protected function gatewayConfigByAlias(string $alias): mixed
    {
        $gateway = Gateway::where('alias', $alias)->first();
        if (!$gateway) {
            return null;
        }
        return json_decode($gateway->gateway_parameters);
    }

    /** Build the canonical sign string (sorted key=value pairs, no empty values). */
    private static function buildSignString(array $params): string
    {
        ksort($params);
        $signData = [];
        foreach ($params as $key => $value) {
            if ($value !== '' && $value !== null && $key !== 'sign') {
                $signData[] = $key . '=' . $value;
            }
        }
        return implode('&', $signData);
    }

    protected static function sign(array $params, string $privateKey): string
    {
        $data      = self::buildSignString($params);
        $signature = '';
        if (!openssl_sign($data, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
            logger()->error('Alipay sign: openssl_sign failed', ['error' => openssl_error_string()]);
        }
        return base64_encode($signature);
    }

    protected static function verify(array $params, string $sign, string $publicKey): bool
    {
        unset($params['sign'], $params['sign_type']);
        ksort($params);
        $verifyData = [];
        foreach ($params as $key => $value) {
            if ($value !== '' && $value !== null) {
                $verifyData[] = $key . '=' . $value;
            }
        }
        $data   = implode('&', $verifyData);
        $result = openssl_verify($data, base64_decode($sign), $publicKey, OPENSSL_ALGO_SHA256);
        return $result === 1;
    }

    protected static function normalizePrivateKey(string $key): string
    {
        $key = trim(str_replace(["\r\n", "\r"], "\n", str_replace(['\\n', '\\r'], "\n", $key)));
        if (!str_contains($key, 'BEGIN')) {
            $key = "-----BEGIN PRIVATE KEY-----\n" . chunk_split(str_replace(["\n", ' '], '', $key), 64, "\n") . "-----END PRIVATE KEY-----";
        }
        return $key;
    }

    protected static function normalizePublicKey(string $key): string
    {
        $key = trim(str_replace(["\r\n", "\r"], "\n", str_replace(['\\n', '\\r'], "\n", $key)));
        if (!str_contains($key, 'BEGIN')) {
            $key = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(str_replace(["\n", ' '], '', $key), 64, "\n") . "-----END PUBLIC KEY-----";
        }
        return $key;
    }
}
