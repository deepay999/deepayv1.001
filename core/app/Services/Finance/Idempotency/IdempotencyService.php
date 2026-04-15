<?php

namespace App\Services\Finance\Idempotency;

use App\Models\IdempotencyKey;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use RuntimeException;

class IdempotencyService
{
    public function reserve(string $key, string $operationType, array $context = []): array
    {
        $requestHash = $this->hashPayload($context['payload'] ?? []);

        try {
            $record = IdempotencyKey::create([
                'idempotency_key' => $key,
                'operation_type' => $operationType,
                'actor_type' => $context['actor_type'] ?? null,
                'actor_id' => $context['actor_id'] ?? null,
                'request_hash' => $requestHash,
                'status' => 'processing',
                'first_seen_at' => now(),
                'last_seen_at' => now(),
                'expires_at' => $context['expires_at'] ?? null,
            ]);

            return ['record' => $record, 'replay' => false];
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23000') {
                throw $exception;
            }

            $existing = IdempotencyKey::query()->where('idempotency_key', $key)->firstOrFail();
            $existing->forceFill(['last_seen_at' => now()])->save();

            if ($existing->request_hash && $requestHash && $existing->request_hash !== $requestHash) {
                throw new RuntimeException('Idempotency key reuse detected with mismatched payload');
            }

            if ($existing->status === 'succeeded') {
                return [
                    'record' => $existing,
                    'replay' => true,
                    'resource_type' => $existing->resource_type,
                    'resource_id' => $existing->resource_id,
                    'response_body' => $existing->response_body ?? [],
                ];
            }

            if ($existing->status === 'processing') {
                throw new RuntimeException('Money command is already being processed');
            }

            throw new RuntimeException('Idempotency key exists in non-replayable state');
        }
    }

    public function complete(IdempotencyKey $record, string $resourceType, int $resourceId, array $responseBody = [], int $responseCode = 200): void
    {
        $record->forceFill([
            'status' => 'succeeded',
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'response_body' => $responseBody,
            'response_code' => $responseCode,
            'last_seen_at' => now(),
        ])->save();
    }

    public function fail(IdempotencyKey $record, array $responseBody = [], int $responseCode = 422, bool $retryable = true): void
    {
        $record->forceFill([
            'status' => $retryable ? 'failed_retryable' : 'failed_terminal',
            'response_body' => $responseBody,
            'response_code' => $responseCode,
            'last_seen_at' => now(),
        ])->save();
    }

    private function hashPayload(array $payload): ?string
    {
        if ($payload === []) {
            return null;
        }

        return hash('sha256', json_encode($this->sortPayload($payload), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    private function sortPayload(array $payload): array
    {
        ksort($payload);

        foreach ($payload as $key => $value) {
            if (is_array($value)) {
                $payload[$key] = $this->sortPayload($value);
            }
        }

        return $payload;
    }
}