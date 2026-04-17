<?php

namespace App\Http\Controllers\Gateway\Cashmaal;

use App\Constants\Status;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Gateway\PaymentController;
use Illuminate\Http\Request;

class ProcessController extends Controller
{
    /*
     * Cashmaal
     */

    public static function process($deposit)
    {
    	$cashmaal = $deposit->gatewayCurrency();
    	$param = json_decode($cashmaal->gateway_parameter);
        $val['pay_method'] = " ";
        $val['amount'] = getAmount($deposit->final_amount);
        $val['currency'] = $cashmaal->currency;
        $val['succes_url'] = route('home').$deposit->success_url;
        $val['cancel_url'] = route('home').$deposit->failed_url;
        $val['client_email'] = $deposit->user_id != 0 ? auth()->user()->email : $deposit->agent->email;
        $val['web_id'] = $param->web_id;
        $val['order_id'] = $deposit->trx;
        $val['addi_info'] = "Deposit";
        $send['url'] = 'https://www.cashmaal.com/Pay/';
        $send['method'] = 'post';
        $send['view'] = 'user.payment.redirect';
        $send['val'] = $val;
        return json_encode($send);
    }

    public function ipn(Request $request)
    {
        $orderId  = $request->post('order_id', '');
        $status   = $request->post('status');
        $currency = $request->post('currency', '');

        if (empty($orderId)) {
            abort(400);
        }

        $gateway = GatewayCurrency::where('gateway_alias', 'Cashmaal')
            ->where('currency', $currency)
            ->first();

        if (!$gateway) {
            abort(404);
        }

        $params  = json_decode($gateway->gateway_parameter);
        $ipnKey  = $params->ipn_key;
        $webId   = $params->web_id;

        $deposit = Deposit::where('trx', $orderId)->orderBy('id', 'DESC')->first();
        if (!$deposit || $deposit->status != Status::PAYMENT_INITIATE) {
            abort(404);
        }

        if ($request->post('ipn_key') !== $ipnKey || $request->post('web_id') != $webId) {
            $notify[] = ['error', 'Data invalid'];
            return redirect($deposit->failed_url)->withNotify($notify);
        }

        if ((int)$status === 2) {
            $notify[] = ['info', 'Payment pending'];
            return redirect($deposit->failed_url)->withNotify($notify);
        }

        if ((int)$status !== 1 || $currency !== $deposit->method_currency) {
            $notify[] = ['error', 'Payment failed'];
            return redirect($deposit->failed_url)->withNotify($notify);
        }

        PaymentController::userDataUpdate($deposit);
        $notify[] = ['success', 'Transaction is successful'];
        return redirect($deposit->success_url)->withNotify($notify);
    }
}
