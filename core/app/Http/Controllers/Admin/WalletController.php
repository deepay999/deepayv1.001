<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModuleSetting;
use App\Models\TransactionCharge;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Deposit;
use App\Models\Withdrawal;
use App\Models\SendMoney;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function overview()
    {
        $pageTitle = 'Wallet Overview';

        $sendMoneyCharge  = TransactionCharge::where('slug', 'send_money')->first();
        $cashOutCharge    = TransactionCharge::where('slug', 'cash_out')->first();
        $cashInCharge     = TransactionCharge::where('slug', 'cash_in')->first();
        $paymentCharge    = TransactionCharge::where('slug', 'payment')->first();
        $bankXferCharge   = TransactionCharge::where('slug', 'bank_transfer')->first();
        $withdrawCharge   = TransactionCharge::where('slug', 'withdraw')->first();

        $modules = ModuleSetting::where('user_type', 'USER')->get();

        $stats = [
            'total_users'         => User::count(),
            'total_balance'       => User::sum('balance'),
            'total_frozen'        => User::sum('frozen_balance'),
            'total_points'        => User::sum('points'),
            'today_deposits'      => Deposit::whereDate('created_at', today())->where('status', 1)->sum('amount'),
            'today_withdrawals'   => Withdrawal::whereDate('created_at', today())->where('status', 1)->sum('amount'),
            'today_transfers'     => SendMoney::whereDate('created_at', today())->sum('amount'),
        ];

        return view('admin.wallet.overview', compact(
            'pageTitle',
            'sendMoneyCharge',
            'cashOutCharge',
            'cashInCharge',
            'paymentCharge',
            'bankXferCharge',
            'withdrawCharge',
            'modules',
            'stats'
        ));
    }
}
