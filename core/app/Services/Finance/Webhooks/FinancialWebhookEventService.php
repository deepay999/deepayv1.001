<?php

namespace App\Services\Finance\Webhooks;

use App\Models\FinancialWebhookEvent;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;

class FinancialWebhookEventService
{
    public function __construct(private BankingWebhookSupport $support)
    {
    }

    public function register(
        string $provider,
        ?string $eventId,
        ?string $eventType,
        bool $signatureValid,
        ?Carbon $eventTimestamp,
        array $payload
    ): array {
        $attributes = [
            'provider' => $provider,
            'event_id' => $eventId,
            'event_type' => $eventType,
            'signature_valid' => $signatureValid,
            'received_at' => now(),
            'event_timestamp' => $eventTimestamp,
            'payload' => $payload,
            'payload_hash' => $this->support->payloadHash($payload),
            'processing_status' => $signatureValid ? 'processing' : 'rejected',
        ];

        if (!$eventId) {
            return [
                'record' => FinancialWebhookEvent::query()->create($attributes),
                'duplicate' => false,
                'hash_mismatch' => false,
            ];
        }

        try {
            return [
                'record' => FinancialWebhookEvent::query()->create($attributes),
                'duplicate' => false,
                'hash_mismatch' => false,
            ];
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23000') {
                throw $exception;
            }

            $existing = FinancialWebhookEvent::query()
                ->where('provider', $provider)
                ->where('event_id', $eventId)
                ->firstOrFail();

            return [
                'record' => $existing,
                'duplicate' => true,
                'hash_mismatch' => $existing->payload_hash !== $attributes['payload_hash'],
            ];
        }
    }

    public function markSucceeded(FinancialWebhookEvent $event, ?string $referenceType = null, ?int $referenceId = null): void
    {
        $event->forceFill([
            'processing_status' => 'succeeded',
            'linked_reference_type' => $referenceType,
            'linked_reference_id' => $referenceId,
            'error_message' => null,
        ])->save();
    }

    public function markIgnored(FinancialWebhookEvent $event, ?string $referenceType = null, ?int $referenceId = null, ?string $message = null): void
    {
        $event->forceFill([
            'processing_status' => 'ignored',
            'linked_reference_type' => $referenceType,
            'linked_reference_id' => $referenceId,
            'error_message' => $message,
        ])->save();
    }

    public function markRejected(FinancialWebhookEvent $event, string $message): void
    {
        $event->forceFill([
            'processing_status' => 'rejected',
            'error_message' => $message,
        ])->save();
    }
}