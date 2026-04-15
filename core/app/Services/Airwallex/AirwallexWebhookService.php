<?php

namespace App\Services\Airwallex;

class AirwallexWebhookService
{
    /**
     * Deposit-related events DeePay needs to listen for.
     */
    public const DEPOSIT_EVENTS = [
        'payment_intent.succeeded',
        'payment_intent.requires_capture',
        'payment_intent.cancelled',
        'payment_attempt.paid',
        'payment_attempt.settled',
        'payment_attempt.authorization_failed',
        'payment_attempt.capture_failed',
        'payment_attempt.expired',
        'payment_attempt.risk_declined',
        'deposit.settled',
        'deposit.pending',
        'deposit.rejected',
        'deposit.reversed',
        'balance.va.top_up',
        'balance.ga.top_up',
    ];

    /**
     * Payout/transfer events for future withdrawal support.
     */
    public const PAYOUT_EVENTS = [
        'payout.transfer.paid',
        'payout.transfer.sent',
        'payout.transfer.failed',
        'payout.transfer.cancelled',
        'wallet_transfer.settled',
        'wallet_transfer.failed',
    ];

    /**
     * Account lifecycle events.
     */
    public const ACCOUNT_EVENTS = [
        'account.active',
        'account.suspended',
        'account.action_required',
        'global_account.active',
        'global_account.closed',
        'global_account.failed',
    ];

    public function __construct(private AirwallexClient $client)
    {
    }

    public function registerDepositWebhook(string $webhookUrl): array
    {
        return $this->client->createWebhook(
            $webhookUrl,
            array_merge(self::DEPOSIT_EVENTS, self::ACCOUNT_EVENTS)
        );
    }

    public function registerFullWebhook(string $webhookUrl): array
    {
        return $this->client->createWebhook(
            $webhookUrl,
            array_merge(self::DEPOSIT_EVENTS, self::PAYOUT_EVENTS, self::ACCOUNT_EVENTS)
        );
    }

    public function listRegistered(): array
    {
        return $this->client->listWebhooks();
    }

    /**
     * Map an Airwallex event name to a settlement-relevant status.
     * Returns null for events that should not trigger settlement.
     */
    public static function mapEventToSettlementStatus(string $eventName): ?string
    {
        return match ($eventName) {
            'payment_intent.succeeded',
            'payment_attempt.paid',
            'payment_attempt.settled',
            'deposit.settled',
            'balance.va.top_up',
            'balance.ga.top_up' => 'SUCCEEDED',

            'payment_intent.requires_capture' => 'REQUIRES_CAPTURE',

            'payment_intent.cancelled',
            'payment_attempt.authorization_failed',
            'payment_attempt.capture_failed',
            'payment_attempt.expired',
            'payment_attempt.risk_declined',
            'deposit.rejected',
            'deposit.reversed' => 'FAILED',

            'deposit.pending' => 'PENDING',

            default => null,
        };
    }
}
