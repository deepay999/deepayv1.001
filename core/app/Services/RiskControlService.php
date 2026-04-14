<?php

namespace App\Services;

use App\Constants\Status;
use App\Models\LedgerEntry;
use App\Models\SendMoney;
use App\Models\User;
use Carbon\Carbon;

/**
 * RiskControlService
 *
 * Enforces transaction limits, detects suspicious patterns,
 * and provides a freeze mechanism.
 */
class RiskControlService {

    // Daily limits by KYC status (in EUR equivalent)
    const DAILY_LIMIT_UNVERIFIED = 500;
    const DAILY_LIMIT_VERIFIED   = 10000;

    // Thresholds for risk detection
    const RAPID_TRANSFER_WINDOW_MINUTES = 10;
    const RAPID_TRANSFER_COUNT          = 5;
    const HIGH_FREQ_DAILY_COUNT         = 20;

    public function __construct(private LedgerService $ledger) {}

    /**
     * Check whether a proposed debit is within the user's daily limit.
     *
     * @throws \RuntimeException if limit exceeded
     */
    public function checkDailyLimit(int $userId, string $currency, float $amount): void {
        $user  = User::findOrFail($userId);
        $limit = $user->kv == Status::KYC_VERIFIED
            ? self::DAILY_LIMIT_VERIFIED
            : self::DAILY_LIMIT_UNVERIFIED;

        $todayDebits = LedgerEntry::where('user_id', $userId)
            ->where('currency', $currency)
            ->where('type', 'debit')
            ->whereDate('created_at', Carbon::today())
            ->sum('amount'); // amounts are negative for debits

        $todayDebits = abs((float) $todayDebits);

        if (($todayDebits + $amount) > $limit) {
            throw new \RuntimeException(
                "Daily transaction limit of {$currency} {$limit} exceeded. Today's debits: {$currency} {$todayDebits}."
            );
        }
    }

    /**
     * Check whether the user's wallet is frozen.
     *
     * @throws \RuntimeException if wallet is frozen
     */
    public function checkWalletNotFrozen(int $userId): void {
        $user = User::findOrFail($userId);

        if ($user->wallet_frozen) {
            throw new \RuntimeException('Your wallet has been frozen. Please contact support.');
        }
    }

    /**
     * Evaluate risk signals and optionally freeze the wallet.
     * Call this after each debit transaction.
     */
    public function evaluateRisk(int $userId, string $currency): void {
        if ($this->isRapidTransfer($userId, $currency) || $this->isHighFrequency($userId)) {
            // Auto-freeze and log
            $this->ledger->freezeWalletAccount($userId);

            \Log::warning('RiskControl: wallet auto-frozen', [
                'user_id'  => $userId,
                'currency' => $currency,
                'reason'   => 'automated_risk_trigger',
            ]);
        }
    }

    /**
     * Detect rapid in-and-out pattern: multiple debits in a short window.
     */
    private function isRapidTransfer(int $userId, string $currency): bool {
        $window = Carbon::now()->subMinutes(self::RAPID_TRANSFER_WINDOW_MINUTES);

        $recentDebits = LedgerEntry::where('user_id', $userId)
            ->where('currency', $currency)
            ->where('type', 'debit')
            ->where('created_at', '>=', $window)
            ->count();

        return $recentDebits >= self::RAPID_TRANSFER_COUNT;
    }

    /**
     * Detect high-frequency transfers today.
     */
    private function isHighFrequency(int $userId): bool {
        $todayCount = LedgerEntry::where('user_id', $userId)
            ->where('type', 'debit')
            ->whereDate('created_at', Carbon::today())
            ->count();

        return $todayCount >= self::HIGH_FREQ_DAILY_COUNT;
    }
}
