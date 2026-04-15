<?php

namespace App\Http\Controllers\Admin;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function settings()
    {
        $pageTitle = 'Loyalty Points Settings';
        return view('admin.loyalty.settings', compact('pageTitle'));
    }

    public function settingsUpdate(Request $request)
    {
        $request->validate([
            'points_per_currency' => 'required|numeric|gt:0',
            'points_value'        => 'required|numeric|gt:0',
            'min_redeem_points'   => 'required|integer|gt:0',
        ]);

        $general                     = gs();
        $general->loyalty_points     = $request->loyalty_points ? Status::ENABLE : Status::DISABLE;
        $general->points_per_currency = $request->points_per_currency;
        $general->points_value        = $request->points_value;
        $general->min_redeem_points   = $request->min_redeem_points;
        $general->save();

        $notify[] = ['success', 'Loyalty points settings updated successfully'];
        return back()->withNotify($notify);
    }

    public function history(Request $request)
    {
        $pageTitle = 'Loyalty Points History';
        $query     = UserPoint::with('user')->orderBy('id', 'desc');

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('username', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $points = $query->paginate(getPaginate());

        return view('admin.loyalty.history', compact('pageTitle', 'points'));
    }

    public function userPoints(Request $request, $userId)
    {
        $user      = User::findOrFail($userId);
        $pageTitle = 'Points History - ' . $user->username;
        $points    = UserPoint::where('user_id', $userId)->orderBy('id', 'desc')->paginate(getPaginate());
        return view('admin.loyalty.user_points', compact('pageTitle', 'points', 'user'));
    }

    public function addSubPoints(Request $request, $userId)
    {
        $request->validate([
            'points'      => 'required|integer|gt:0',
            'act'         => 'required|in:add,sub',
            'description' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($userId);

        if ($request->act == 'add') {
            UserPoint::adminAdd($user->id, $request->points, $request->description);
            $message = 'Points added successfully';
        } else {
            if ($request->points > $user->points) {
                $notify[] = ['error', $user->username . ' doesn\'t have sufficient points.'];
                return back()->withNotify($notify);
            }
            UserPoint::adminDeduct($user->id, $request->points, $request->description);
            $message = 'Points deducted successfully';
        }

        $notify[] = ['success', $message];
        return back()->withNotify($notify);
    }

    public function redeemPoints(Request $request, $userId)
    {
        $request->validate([
            'points' => 'required|integer|gt:0',
        ]);

        $user   = User::findOrFail($userId);
        $gs     = gs();
        $points = $request->points;

        if (!$gs->loyalty_points) {
            $notify[] = ['error', 'Loyalty points system is disabled'];
            return back()->withNotify($notify);
        }

        if ($points < $gs->min_redeem_points) {
            $notify[] = ['error', 'Minimum ' . $gs->min_redeem_points . ' points required for redemption'];
            return back()->withNotify($notify);
        }

        if ($points > $user->points) {
            $notify[] = ['error', 'User doesn\'t have sufficient points'];
            return back()->withNotify($notify);
        }

        $cashValue = $points * $gs->points_value;
        $trx       = getTrx();

        UserPoint::redeem($user->id, $points, 'Redeemed ' . $points . ' points for ' . showAmount($cashValue, currencyFormat: false) . ' ' . gs('cur_text'), $trx);

        $user->balance += $cashValue;
        $user->save();

        $transaction               = new Transaction();
        $transaction->user_id      = $user->id;
        $transaction->amount       = $cashValue;
        $transaction->post_balance = $user->balance;
        $transaction->charge       = 0;
        $transaction->trx_type     = '+';
        $transaction->details      = 'Points redeemed: ' . $points . ' pts = ' . showAmount($cashValue, currencyFormat: false) . ' ' . gs('cur_text');
        $transaction->trx          = $trx;
        $transaction->remark       = 'points_redeem';
        $transaction->save();

        $notify[] = ['success', 'Points redeemed successfully. ' . showAmount($cashValue, currencyFormat: false) . ' ' . gs('cur_text') . ' added to user balance.'];
        return back()->withNotify($notify);
    }
}
