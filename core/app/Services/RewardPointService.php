<?php

namespace App\Services;

use App\Models\RewardPointLedger;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * RewardPointService
 *
 * Manages a non-cash reward points ledger.
 * Points are earned on qualifying transactions and can be redeemed for
 * in-app benefits (discounts on fees, unlocking features, etc.).
 * Points have no monetary value and cannot be converted to cash directly.
 */
class RewardPointService
{
    // Points earned per monetary unit (configurable)
    const POINTS_PER_EUR_TRANSFER = 1;  // 1 point per EUR transferred
    const POINTS_PER_EUR_PAYOUT   = 2;  // 2 points per EUR paid out

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Earn points for a user.
     */
    public function earn(
        User    $user,
        int     $points,
        string  $source,
        string  $description,
        ?string $referenceId = null,
        ?array  $meta        = [],
        ?\DateTimeInterface $expiresAt = null
    ): RewardPointLedger {
        return DB::transaction(function () use ($user, $points, $source, $description, $referenceId, $meta, $expiresAt) {
            $balance = $this->getBalance($user);
            $trx     = $this->generateTrx();

            return RewardPointLedger::create([
                'user_id'         => $user->id,
                'trx'             => $trx,
                'entry_type'      => RewardPointLedger::TYPE_EARN,
                'points'          => abs($points),
                'running_balance' => $balance + abs($points),
                'description'     => $description,
                'source'          => $source,
                'reference_id'    => $referenceId,
                'expires_at'      => $expiresAt,
                'meta'            => $meta,
            ]);
        });
    }

    /**
     * Redeem points for a user.
     * Throws \DomainException if the user has insufficient points.
     */
    public function redeem(
        User    $user,
        int     $points,
        string  $description,
        ?string $referenceId = null,
        ?array  $meta        = []
    ): RewardPointLedger {
        return DB::transaction(function () use ($user, $points, $description, $referenceId, $meta) {
            $balance = $this->getBalance($user);

            if ($balance < $points) {
                throw new \DomainException('Insufficient reward points');
            }

            $trx = $this->generateTrx();

            return RewardPointLedger::create([
                'user_id'         => $user->id,
                'trx'             => $trx,
                'entry_type'      => RewardPointLedger::TYPE_REDEEM,
                'points'          => -abs($points),
                'running_balance' => $balance - abs($points),
                'description'     => $description,
                'source'          => 'redemption',
                'reference_id'    => $referenceId,
                'meta'            => $meta,
            ]);
        });
    }

    /**
     * Return the current active point balance for a user.
     */
    public function getBalance(User $user): int
    {
        return (int) RewardPointLedger::where('user_id', $user->id)->sum('points');
    }

    /**
     * Return paginated point history for a user.
     */
    public function history(User $user, int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return RewardPointLedger::forUser($user->id)
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Award points automatically based on a monetary transaction amount.
     */
    public function awardForTransfer(User $user, float $amount, string $trxRef): void
    {
        $points = (int) floor($amount * self::POINTS_PER_EUR_TRANSFER);
        if ($points < 1) {
            return;
        }
        $this->earn(
            $user,
            $points,
            'send_money',
            "Earned {$points} pts for transfer of €{$amount}",
            $trxRef
        );
    }

    /**
     * Award points automatically based on a payout amount.
     */
    public function awardForPayout(User $user, float $amount, string $trxRef): void
    {
        $points = (int) floor($amount * self::POINTS_PER_EUR_PAYOUT);
        if ($points < 1) {
            return;
        }
        $this->earn(
            $user,
            $points,
            'payout',
            "Earned {$points} pts for payout of €{$amount}",
            $trxRef
        );
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    protected function generateTrx(): string
    {
        do {
            $trx = strtoupper(Str::random(16));
        } while (RewardPointLedger::where('trx', $trx)->exists());

        return $trx;
    }
}
