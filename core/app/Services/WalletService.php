<?php

namespace App\Services;

use App\Models\LedgerEntry;
use App\Models\RewardPoint;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Collection;

/**
 * WalletService
 *
 * High-level wallet operations built on top of LedgerService.
 */
class WalletService {

    public function __construct(private LedgerService $ledger) {}

    /**
     * Get all wallets for a user with computed balances.
     *
     * @return Collection<array{currency: string, total: float, available: float, frozen: float}>
     */
    public function getUserWallets(int $userId): Collection {
        $wallets = Wallet::where('user_id', $userId)->where('is_active', true)->get();

        // Also include currencies that have ledger entries but no wallet row yet
        $ledgerCurrencies = LedgerEntry::where('user_id', $userId)
            ->distinct()
            ->pluck('currency');

        $allCurrencies = $wallets->pluck('currency')
            ->merge($ledgerCurrencies)
            ->unique()
            ->values();

        return $allCurrencies->map(function (string $currency) use ($userId) {
            $total     = $this->ledger->getBalance($userId, $currency);
            $frozen    = $this->ledger->getFrozenAmount($userId, $currency);
            $available = max(0, $total - $frozen);

            return [
                'currency'  => $currency,
                'total'     => round($total,     2),
                'available' => round($available, 2),
                'frozen'    => round($frozen,    2),
            ];
        });
    }

    /**
     * Get ledger history for a user (optionally filtered by currency).
     */
    public function getLedgerHistory(int $userId, ?string $currency = null, int $perPage = 20): \Illuminate\Pagination\LengthAwarePaginator {
        $query = LedgerEntry::where('user_id', $userId)
            ->orderByDesc('created_at');

        if ($currency) {
            $query->where('currency', strtoupper($currency));
        }

        return $query->paginate($perPage);
    }

    /**
     * Get the total reward points balance for a user (non-withdrawable).
     */
    public function getRewardPointsBalance(int $userId): float {
        return (float) RewardPoint::where('user_id', $userId)->sum('points');
    }

    /**
     * Award reward points.
     */
    public function awardPoints(
        int $userId,
        float $points,
        string $source,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $description = null
    ): RewardPoint {
        return RewardPoint::create([
            'user_id'        => $userId,
            'points'         => abs($points),
            'type'           => 'earned',
            'source'         => $source,
            'reference_type' => $referenceType,
            'reference_id'   => $referenceId,
            'description'    => $description,
        ]);
    }

    /**
     * Spend reward points (e.g., redeem on platform).
     * Points cannot be withdrawn or traded.
     */
    public function spendPoints(int $userId, float $points, string $description = ''): RewardPoint {
        $balance = $this->getRewardPointsBalance($userId);

        if ($balance < $points) {
            throw new \RuntimeException('Insufficient reward points.');
        }

        return RewardPoint::create([
            'user_id'     => $userId,
            'points'      => -abs($points),
            'type'        => 'spent',
            'source'      => 'platform_redemption',
            'description' => $description,
        ]);
    }

    /**
     * Ensure default wallets (EUR/USD/GBP) exist for a new user.
     */
    public function createDefaultWallets(int $userId): void {
        foreach (LedgerService::SUPPORTED_CURRENCIES as $currency) {
            $this->ledger->getOrCreateWallet($userId, $currency);
        }
    }
}
