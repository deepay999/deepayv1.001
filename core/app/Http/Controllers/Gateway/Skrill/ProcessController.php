<?php

namespace App\Http\Controllers\Gateway\Skrill;

use App\Constants\Status;
use App\Models\Deposit;
use App\Http\Controllers\Gateway\PaymentController;
use App\Http\Controllers\Controller;

class ProcessController extends Controller
{

    /*
     * Skrill Gateway
     */
    public static function process($deposit)
    {
        $general = gs();
        $skrillAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);


        $val['pay_to_email'] = trim($skrillAcc->pay_to_email);
        $val['transaction_id'] = "$deposit->trx";

        $val['return_url'] = route('home').$deposit->success_url;
        $val['return_url_text'] = "Return $general->site_name";
        $val['cancel_url'] = route('home').$deposit->failed_url;
        $val['status_url'] = route('ipn.'.$deposit->gateway->alias);
        $val['language'] = 'EN';
        $val['amount'] = round($deposit->final_amount,2);
        $val['currency'] = "$deposit->method_currency";
        $val['detail1_description'] = "$general->site_name";
        $val['detail1_text'] = "Pay To $general->site_name";
        $val['logo_url'] = siteLogo();

        $send['val'] = $val;
        $send['view'] = 'user.payment.redirect';
        $send['method'] = 'post';
        $send['url'] = 'https://www.moneybookers.com/app/payment.pl';
        return json_encode($send);
    }


    public function ipn()
    {
        $post = request()->post();

        if (empty($post['transaction_id'])) {
            abort(400);
        }

        $deposit = Deposit::where('trx', $post['transaction_id'])->orderBy('id', 'DESC')->first();
        if (!$deposit || $deposit->status != Status::PAYMENT_INITIATE) {
            return;
        }

        $skrillrAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $concatFields = ($post['merchant_id'] ?? '')
            . ($post['transaction_id'] ?? '')
            . strtoupper(md5($skrillrAcc->secret_key))
            . ($post['mb_amount'] ?? '')
            . ($post['mb_currency'] ?? '')
            . ($post['status'] ?? '');

        $md5sig   = $post['md5sig'] ?? '';
        $status   = $post['status'] ?? '';
        $payEmail = $post['pay_to_email'] ?? '';

        if (hash_equals(strtoupper(md5($concatFields)), strtoupper($md5sig))
            && $status == 2
            && $payEmail === $skrillrAcc->pay_to_email
        ) {
            PaymentController::userDataUpdate($deposit);
        }
    }
}
