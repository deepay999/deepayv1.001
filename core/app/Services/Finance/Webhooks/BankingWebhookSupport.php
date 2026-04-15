<?php

namespace App\Services\Finance\Webhooks;

use Illuminate\Support\Carbon;

class BankingWebhookSupport
{
    public function parameterValue(object|array|null $parameters, string $key, mixed $default = null): mixed
    {
        if ($parameters === null) {
            return $default;
        }

        $value = is_array($parameters)
            ? ($parameters[$key] ?? null)
            : ($parameters->{$key} ?? null);

        if (is_object($value) && property_exists($value, 'value')) {
            $value = $value->value;
        }

        if (is_array($value) && array_key_exists('value', $value)) {
            $value = $value['value'];
        }

        return $value ?? $default;
    }

    public function resolveSuccessStates(object|array|null $parameters, string $key, string $default): array
    {
        $value = $this->parameterValue($parameters, $key, $default);

        return array_values(array_filter(array_map('trim', explode(',', (string) $value))));
    }

    public function extractReference(array $payload, array $candidateKeys): ?string
    {
        foreach ($candidateKeys as $candidateKey) {
            $value = $this->findFirstByKey($payload, $candidateKey);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }

            if (is_numeric($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    public function extractTimestamp(array $payload, array $candidateKeys): ?Carbon
    {
        foreach ($candidateKeys as $candidateKey) {
            $value = $this->findFirstByKey($payload, $candidateKey);

            if ($value === null || $value === '') {
                continue;
            }

            if (is_numeric($value)) {
                return Carbon::createFromTimestampUTC((int) $value);
            }

            if (is_string($value)) {
                try {
                    return Carbon::parse($value);
                } catch (\Throwable) {
                    continue;
                }
            }
        }

        return null;
    }

    public function isFresh(?Carbon $eventTimestamp, int $maxSkewSeconds): bool
    {
        if ($eventTimestamp === null) {
            return true;
        }

        return abs($eventTimestamp->diffInSeconds(now(), false)) <= $maxSkewSeconds;
    }

    public function payloadHash(array $payload): string
    {
        return hash('sha256', json_encode($this->sortPayload($payload), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    public function findFirstByKey(array $payload, string $targetKey): mixed
    {
        foreach ($payload as $key => $value) {
            if ((string) $key === $targetKey) {
                return $value;
            }

            if (is_array($value)) {
                $nested = $this->findFirstByKey($value, $targetKey);
                if ($nested !== null) {
                    return $nested;
                }
            }
        }

        return null;
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