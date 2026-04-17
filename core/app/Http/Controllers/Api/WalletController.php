<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller {

    public function __construct(private WalletService $walletService) {}

    /**
     * GET /api/wallets
     * Returns all wallet balances for the authenticated user.
     */
    public function index(): JsonResponse {
        $user    = auth()->user();
        $wallets = $this->walletService->getUserWallets($user->id);
        $points  = $this->walletService->getRewardPointsBalance($user->id);

        return apiResponse('wallets', 'success', ['Wallet balances'], [
            'wallets'        => $wallets,
            'reward_points'  => round($points, 2),
        ]);
    }

    /**
     * GET /api/wallets/ledger?currency=EUR&page=1
     * Returns paginated ledger history.
     */
    public function ledger(Request $request): JsonResponse {
        $user     = auth()->user();
        $currency = $request->query('currency');
        $perPage  = min((int) $request->query('per_page', 20), 100);

        $history = $this->walletService->getLedgerHistory($user->id, $currency, $perPage);

        return apiResponse('ledger', 'success', ['Ledger history'], [
            'ledger' => $history,
        ]);
    }
}
