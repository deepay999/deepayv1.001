<?php

namespace App\Http\Controllers\Gateway\Instamojo;

use App\Constants\Status;
use App\Models\Deposit;
use App\Http\Controllers\Gateway\PaymentController;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProcessController extends Controller
{

    /*
     * Instamojo Gateway
     */
    public static function process($deposit)
    {
        $instaMojoAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);


        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://www.instamojo.com/api/1.1/payment-requests/');
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                "X-Api-Key:$instaMojoAcc->api_key",
                "X-Auth-Token:$instaMojoAcc->auth_token"
            )
        );
        $payload = array(
            'purpose' => 'Payment to ' . gs('site_name'),
            'amount' => round($deposit->final_amount,2),
            'buyer_name' => $deposit->user->username,
            'redirect_url' => route('home').$deposit->success_url,
            'webhook' => route('ipn.'.$deposit->gateway->alias),
            'email' => $deposit->user->email,
            'send_email' => true,
            'allow_repeated_payments' => false
        );

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
        $response = curl_exec($ch);
        curl_close($ch);
        $res = json_decode($response);
        if (@$res->success) {
            if(!@$res->payment_request->id){
                $send['error'] = true;
                $send['message'] = "Response not given from API. Please re-check the API credentials.";
            }else{
                $deposit->btc_wallet = $res->payment_request->id;
                $deposit->save();
                $send['redirect'] = true;
                $send['redirect_url'] = $res->payment_request->longurl;
            }
        } else {
            $send['error'] = true;
            $send['message'] = "Credentials mismatch. Please contact with admin";
        }
        return json_encode($send);
    }

    public function ipn(Request $request)
    {
        $paymentRequestId = $request->post('payment_request_id');
        if (empty($paymentRequestId)) {
            abort(400);
        }

        $deposit = Deposit::where('btc_wallet', $paymentRequestId)->orderBy('id', 'DESC')->first();
        if (!$deposit || $deposit->status != Status::PAYMENT_INITIATE) {
            return;
        }

        $instaMojoAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $deposit->detail = $request->all();
        $deposit->save();

        $imData  = $request->post();
        $macSent = $imData['mac'] ?? '';
        unset($imData['mac']);
        ksort($imData, SORT_STRING | SORT_FLAG_CASE);
        $mac = hash_hmac("sha1", implode("|", $imData), $instaMojoAcc->salt);

        if (hash_equals($mac, $macSent) && ($imData['status'] ?? '') === "Credit") {
            PaymentController::userDataUpdate($deposit);
        }
    }
}
