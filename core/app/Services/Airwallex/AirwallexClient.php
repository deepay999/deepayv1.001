<?php

namespace App\Services\Airwallex;

use App\Models\Gateway;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AirwallexClient
{
    public function getAccessToken(bool $forceRefresh = false): array
    {
        $credentials = $this->credentials();
        $cacheKey = $this->tokenCacheKey($credentials['client_id']);

        if (!$forceRefresh) {
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && !empty($cached['token'])) {
                return $cached;
            }
        }

        $response = Http::baseUrl($credentials['api_url'])
            ->acceptJson()
            ->asJson()
            ->withHeaders([
                'x-client-id' => $credentials['client_id'],
                'x-api-key' => $credentials['api_key'],
            ])
            ->post('/authentication/login');

        if ($response->failed()) {
            throw new RuntimeException('Unable to authenticate with Airwallex: ' . $response->body());
        }

        $payload = $response->json();
        $token = $payload['token'] ?? null;
        $expiresAt = $payload['expires_at'] ?? null;

        if (!$token || !$expiresAt) {
            throw new RuntimeException('Airwallex authentication response is missing token or expires_at');
        }

        $ttlSeconds = max(now()->diffInSeconds($expiresAt, false) - 60, 60);
        $result = [
            'token' => $token,
            'expires_at' => $expiresAt,
        ];

        Cache::put($cacheKey, $result, now()->addSeconds($ttlSeconds));

        return $result;
    }

    public function createConnectedAccount(array $payload): array
    {
        return $this->request('post', '/accounts/create', $payload);
    }

    public function createGlobalAccount(array $payload, ?string $onBehalfOf = null): array
    {
        return $this->request('post', '/global_accounts/create', $payload, $onBehalfOf);
    }

    public function createConversion(array $payload, ?string $onBehalfOf = null): array
    {
        return $this->request('post', '/conversions/create', $payload, $onBehalfOf);
    }

    public function createWebhook(string $url, array $events): array
    {
        return $this->request('post', '/webhooks/create', [
            'url' => $url,
            'active' => true,
            'events' => $events,
        ]);
    }

    public function listWebhooks(): array
    {
        return $this->request('get', '/webhooks');
    }

    public function getBalances(?string $onBehalfOf = null): array
    {
        return $this->request('get', '/balances/current', [], $onBehalfOf);
    }

    public function request(string $method, string $path, array $payload = [], ?string $onBehalfOf = null): array
    {
        $credentials = $this->credentials();
        $token = $this->getAccessToken()['token'];

        $request = $this->baseRequest($credentials['api_url'], $token);

        if ($onBehalfOf) {
            $request->withHeaders([
                'x-on-behalf-of' => $onBehalfOf,
            ]);
        }

        $response = $request->{$method}(ltrim($path, '/'), $payload);

        if ($response->unauthorized()) {
            $token = $this->getAccessToken(true)['token'];
            $request = $this->baseRequest($credentials['api_url'], $token);
            if ($onBehalfOf) {
                $request->withHeaders([
                    'x-on-behalf-of' => $onBehalfOf,
                ]);
            }
            $response = $request->{$method}(ltrim($path, '/'), $payload);
        }

        if ($response->failed()) {
            throw new RuntimeException('Airwallex request failed: ' . $response->body());
        }

        return $response->json() ?? [];
    }

    private function baseRequest(string $apiUrl, string $token): PendingRequest
    {
        return Http::baseUrl($apiUrl)
            ->acceptJson()
            ->asJson()
            ->withToken($token);
    }

    private function credentials(): array
    {
        $gateway = Gateway::query()->where('alias', 'Airwallex')->first();
        if (!$gateway) {
            throw new RuntimeException('Airwallex gateway is not configured');
        }

        $parameters = json_decode($gateway->gateway_parameters ?? '{}', true);
        $clientId = Arr::get($parameters, 'client_id.value');
        $apiKey = Arr::get($parameters, 'api_key.value');
        $apiUrl = Arr::get($parameters, 'api_url.value', 'https://api-demo.airwallex.com/api/v1');

        if (!$clientId || !$apiKey) {
            throw new RuntimeException('Airwallex client_id or api_key is missing');
        }

        return [
            'client_id' => $clientId,
            'api_key' => $apiKey,
            'api_url' => rtrim($apiUrl, '/'),
        ];
    }

    private function tokenCacheKey(string $clientId): string
    {
        return 'airwallex:access-token:' . sha1($clientId);
    }
}