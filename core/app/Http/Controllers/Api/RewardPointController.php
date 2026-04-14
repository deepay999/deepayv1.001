<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RewardPointService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * RewardPointController
 *
 * Exposes the non-cash reward points system over the API.
 * Routes:
 *   GET  rewards/balance   – current points balance
 *   GET  rewards/history   – paginated points ledger
 *   POST rewards/redeem    – redeem points for an in-app benefit
 */
class RewardPointController extends Controller
{
    public function __construct(protected RewardPointService $rewards) {}

    /**
     * GET /api/rewards/balance
     */
    public function balance(): JsonResponse
    {
        $user    = auth()->user();
        $balance = $this->rewards->getBalance($user);

        return apiResponse('rewards_balance', 'success', ['Points balance retrieved'], [
            'points_balance' => $balance,
            'note'           => 'Points have no monetary value and cannot be converted to cash',
        ]);
    }

    /**
     * GET /api/rewards/history
     */
    public function history(): JsonResponse
    {
        $user    = auth()->user();
        $history = $this->rewards->history($user);

        return apiResponse('rewards_history', 'success', ['Points history retrieved'], [
            'history' => $history,
        ]);
    }

    /**
     * POST /api/rewards/redeem
     *
     * Body: { points, reason }
     * Redemption grants an in-app benefit (e.g. fee waiver token).
     * Points are non-cash and cannot be redeemed for real money.
     */
    public function redeem(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return apiResponse('validation_error', 'error', $validator->errors()->all());
        }

        $user = auth()->user();

        try {
            $entry = $this->rewards->redeem(
                $user,
                (int) $request->points,
                $request->reason
            );

            $remaining = $this->rewards->getBalance($user);

            $notify[] = "{$request->points} points redeemed successfully";
            return apiResponse('points_redeemed', 'success', $notify, [
                'redeemed_points'   => abs($entry->points),
                'remaining_balance' => $remaining,
                'trx'               => $entry->trx,
            ]);
        } catch (\DomainException $e) {
            return apiResponse('redemption_failed', 'error', [$e->getMessage()]);
        }
    }
}
