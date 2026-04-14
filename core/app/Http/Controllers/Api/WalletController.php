<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LedgerService;
use App\Services\RewardPointService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * WalletController
 *
 * Exposes the internal ledger-based wallet over the API.
 * Routes:
 *   GET  wallet/balance         – current balance + reward points
 *   GET  wallet/ledger          – paginated ledger entries
 *   POST wallet/transfer        – internal peer-to-peer transfer
 */
class WalletController extends Controller
{
    public function __construct(
        protected LedgerService      $ledger,
        protected RewardPointService $rewards
    ) {}

    /**
     * GET /api/wallet/balance
     */
    public function balance(): JsonResponse
    {
        $user   = auth()->user()->makeVisible('balance');
        $points = $this->rewards->getBalance($user);

        return apiResponse('wallet_balance', 'success', ['Wallet balance retrieved'], [
            'balance'       => $user->balance,
            'currency'      => 'EUR',
            'reward_points' => $points,
        ]);
    }

    /**
     * GET /api/wallet/ledger
     */
    public function ledger(): JsonResponse
    {
        $user    = auth()->user();
        $entries = $this->ledger->ledger($user);

        return apiResponse('wallet_ledger', 'success', ['Ledger retrieved'], [
            'ledger' => $entries,
        ]);
    }

    /**
     * POST /api/wallet/transfer
     *
     * Body: { user (username|mobile), amount, description? }
     */
    public function transfer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user'        => 'required|string',
            'amount'      => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return apiResponse('validation_error', 'error', $validator->errors()->all());
        }

        $sender   = auth()->user();
        $receiver = findUserWithUsernameOrMobile('Recipient not found');

        try {
            $result = $this->ledger->internalTransfer(
                $sender,
                $receiver,
                (float) $request->amount,
                fee: 0.0,
                description: $request->description ?? ''
            );

            // Award reward points to sender
            $this->rewards->awardForTransfer($sender, (float) $request->amount, $result['trx']);

            $notify[] = 'Transfer completed successfully';
            return apiResponse('transfer_success', 'success', $notify, [
                'trx'    => $result['trx'],
                'amount' => $request->amount,
            ]);
        } catch (\DomainException $e) {
            return apiResponse('transfer_failed', 'error', [$e->getMessage()]);
        }
    }
}
