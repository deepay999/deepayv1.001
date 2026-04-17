<?php

namespace App\Http\Controllers\Gateway\Paytm;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Gateway\PaymentController;
use App\Http\Controllers\Gateway\Paytm\PayTM;
use App\Models\Deposit;

class ProcessController extends Controller
{
    /*
     * PayTM Gateway
     */

    public static function process($deposit)
    {
        $PayTmAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);


        $alias = $deposit->gateway->alias;

        $val['MID'] = trim($PayTmAcc->MID);
        $val['WEBSITE'] = trim($PayTmAcc->WEBSITE);
        $val['CHANNEL_ID'] = trim($PayTmAcc->CHANNEL_ID);
        $val['INDUSTRY_TYPE_ID'] = trim($PayTmAcc->INDUSTRY_TYPE_ID);

        try {
            $checkSumHash = (new PayTM())->getChecksumFromArray($val, $PayTmAcc->merchant_key);
        } catch (\Exception $e) {
            $send['error'] = true;
            $send['message'] = $e->getMessage();
            return json_encode($send);
        }

        $val['ORDER_ID'] = $deposit->trx;
        $val['TXN_AMOUNT'] = round($deposit->final_amount,2);
        $val['CUST_ID'] = $deposit->user_id != 0 ? $deposit->user_id : $deposit->agent->id;
        $val['CALLBACK_URL'] = route('ipn.'.$alias);
        $val['CHECKSUMHASH'] = $checkSumHash;

        $send['val'] = $val;
        $send['view'] = 'user.payment.redirect';
        $send['method'] = 'post';
        $send['url'] = $PayTmAcc->transaction_url . "?orderid=" . $deposit->trx;

        return json_encode($send);
    }
    public function ipn()
    {
        $post = request()->post();

        if (empty($post['ORDERID'])) {
            abort(400);
        }

        $deposit = Deposit::where('trx', $post['ORDERID'])->orderBy('id', 'DESC')->first();
        if (!$deposit || $deposit->status != Status::PAYMENT_INITIATE) {
            $notify[] = ['error', 'Invalid request'];
            return redirect('/')->withNotify($notify);
        }

        $PayTmAcc = json_decode($deposit->gatewayCurrency()->gateway_parameter);
        $ptm = new PayTM();

        if ($ptm->verifychecksum_e($post, $PayTmAcc->merchant_key, $post['CHECKSUMHASH'] ?? '') === "TRUE") {
            if (($post['RESPCODE'] ?? '') === "01") {
                $requestParamList = [
                    "MID"     => $PayTmAcc->MID,
                    "ORDERID" => $post['ORDERID'],
                ];
                $StatusCheckSum = $ptm->getChecksumFromArray($requestParamList, $PayTmAcc->merchant_key);
                $requestParamList['CHECKSUMHASH'] = $StatusCheckSum;
                $responseParamList = $ptm->callNewAPI($PayTmAcc->transaction_status_url, $requestParamList);

                if (($responseParamList['STATUS'] ?? '') === 'TXN_SUCCESS'
                    && (float)($responseParamList['TXNAMOUNT'] ?? 0) == (float)($post['TXNAMOUNT'] ?? 0)
                ) {
                    PaymentController::userDataUpdate($deposit);
                    $notify[] = ['success', 'Transaction is successful'];
                    return redirect($deposit->success_url)->withNotify($notify);
                }
                $notify[] = ['error', 'Server communication error. Please contact administrator.'];
            } else {
                $notify[] = ['error', $post['RESPMSG'] ?? 'Payment failed'];
            }
        } else {
            $notify[] = ['error', 'Security verification failed'];
        }

        return redirect($deposit->failed_url)->withNotify($notify);
    }
}
