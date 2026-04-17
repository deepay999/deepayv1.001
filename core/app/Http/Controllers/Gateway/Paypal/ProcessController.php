<?php

namespace App\Http\Controllers\Gateway\Paypal;

use App\Constants\Status;
use App\Models\Deposit;
use App\Http\Controllers\Gateway\PaymentController;
use App\Http\Controllers\Controller;
use App\Lib\CurlRequest;

class ProcessController extends Controller
{

    public static function process($deposit)
    {
        $general = gs();
        $paypalAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $val['cmd'] = '_xclick';
        $val['business'] = trim($paypalAcc->paypal_email);
        $val['cbt'] = $general->site_name;
        $val['currency_code'] = "$deposit->method_currency";
        $val['quantity'] = 1;
        $val['item_name'] = "Payment To $general->site_name Account";
        $val['custom'] = "$deposit->trx";
        $val['amount'] = round($deposit->final_amount,2);
        $val['return'] = route('home').$deposit->success_url;
        $val['cancel_return'] = route('home').$deposit->failed_url;
        $val['notify_url'] = route('ipn.'.$deposit->gateway->alias);
        $send['val'] = $val;
        $send['view'] = 'user.payment.redirect';
        $send['method'] = 'post';
        // $send['url'] = 'https://www.sandbox.paypal.com/'; // use for sandbod text
        $send['url'] = 'https://www.paypal.com/cgi-bin/webscr';
        return json_encode($send);
    }

    public function ipn()
    {
        $raw_post_data  = file_get_contents('php://input');
        $raw_post_array = explode('&', $raw_post_data);
        $myPost         = [];
        foreach ($raw_post_array as $keyval) {
            $keyval = explode('=', $keyval);
            if (count($keyval) === 2) {
                $myPost[$keyval[0]] = urldecode($keyval[1]);
            }
        }

        $req = 'cmd=_notify-validate';
        $details = [];
        foreach ($myPost as $key => $value) {
            $value        = urlencode(stripslashes($value));
            $req         .= "&$key=$value";
            $details[$key] = $value;
        }

        $paypalURL = "https://ipnpb.paypal.com/cgi-bin/webscr?";
        $response  = CurlRequest::curlContent($paypalURL . $req);

        if ($response === "VERIFIED") {
            $trx     = $myPost['custom'] ?? '';
            $mcGross = $myPost['mc_gross'] ?? '';

            if (empty($trx)) {
                return;
            }

            $deposit = Deposit::where('trx', $trx)->orderBy('id', 'DESC')->first();
            if (!$deposit || $deposit->status != Status::PAYMENT_INITIATE) {
                return;
            }

            $deposit->detail = $details;
            $deposit->save();

            if ((float)$mcGross >= round((float)$deposit->final_amount, 2)) {
                PaymentController::userDataUpdate($deposit);
            }
        }
    }
}
