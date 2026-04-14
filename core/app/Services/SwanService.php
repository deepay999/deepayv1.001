<?php

namespace App\Services;

use App\Models\SwanAccount;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SwanService
 *
 * Handles provisioning of dedicated Swan IBAN accounts per user.
 * No fund pooling: each user receives their own individual Swan payment account.
 *
 * Required env vars:
 *   SWAN_API_URL          – Swan GraphQL / REST base URL
 *   SWAN_API_TOKEN        – Server-to-server OAuth token (or bearer token)
 *   SWAN_WEBHOOK_SECRET   – HMAC secret for webhook signature verification
 */
class SwanService
{
    protected string $apiUrl;
    protected string $apiToken;
    protected string $webhookSecret;

    public function __construct()
    {
        $this->apiUrl        = rtrim(config('services.swan.api_url', 'https://api.swan.io'), '/');
        $this->apiToken      = config('services.swan.api_token', '');
        $this->webhookSecret = config('services.swan.webhook_secret', '');
    }

    // -------------------------------------------------------------------------
    // Account provisioning
    // -------------------------------------------------------------------------

    /**
     * Provision a new individual Swan payment account for the given user.
     * Returns the SwanAccount model (created or pre-existing).
     */
    public function provisionAccount(User $user): SwanAccount
    {
        $existing = SwanAccount::where('user_id', $user->id)->first();
        if ($existing) {
            return $existing;
        }

        $payload = [
            'query' => '
                mutation OpenPaymentAccount($input: OpenPaymentAccountInput!) {
                    openPaymentAccount(input: $input) {
                        paymentAccount {
                            id
                            IBAN
                            BIC
                            name
                            statusInfo { status }
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'name'      => trim($user->firstname . ' ' . $user->lastname),
                    'currency'  => 'EUR',
                    'externalId'=> 'deepay_user_' . $user->id,
                ],
            ],
        ];

        $response = $this->post('/graphql', $payload);

        $accountData = $response['data']['openPaymentAccount']['paymentAccount'] ?? null;

        $swanAccount = SwanAccount::create([
            'user_id'              => $user->id,
            'swan_account_id'      => $accountData['id'] ?? null,
            'iban'                 => $accountData['IBAN'] ?? null,
            'bic'                  => $accountData['BIC'] ?? null,
            'account_holder_name'  => $accountData['name'] ?? null,
            'status'               => $this->mapSwanStatus($accountData['statusInfo']['status'] ?? 'Pending'),
            'currency'             => 'EUR',
            'swan_payload'         => $accountData,
            'activated_at'         => ($accountData['statusInfo']['status'] ?? '') === 'Opened' ? now() : null,
        ]);

        return $swanAccount;
    }

    /**
     * Refresh account details from Swan and update local record.
     */
    public function refreshAccount(SwanAccount $swanAccount): SwanAccount
    {
        $payload = [
            'query' => '
                query GetPaymentAccount($id: ID!) {
                    paymentAccount(id: $id) {
                        id
                        IBAN
                        BIC
                        name
                        statusInfo { status }
                    }
                }
            ',
            'variables' => ['id' => $swanAccount->swan_account_id],
        ];

        $response    = $this->post('/graphql', $payload);
        $accountData = $response['data']['paymentAccount'] ?? null;

        if ($accountData) {
            $swanAccount->update([
                'iban'                => $accountData['IBAN'] ?? $swanAccount->iban,
                'bic'                 => $accountData['BIC'] ?? $swanAccount->bic,
                'account_holder_name' => $accountData['name'] ?? $swanAccount->account_holder_name,
                'status'              => $this->mapSwanStatus($accountData['statusInfo']['status'] ?? 'Pending'),
                'swan_payload'        => $accountData,
                'activated_at'        => ($accountData['statusInfo']['status'] ?? '') === 'Opened' ? ($swanAccount->activated_at ?? now()) : $swanAccount->activated_at,
            ]);
        }

        return $swanAccount->fresh();
    }

    // -------------------------------------------------------------------------
    // Webhook verification
    // -------------------------------------------------------------------------

    /**
     * Verify the Swan webhook signature (HMAC-SHA256 over raw body).
     */
    public function verifyWebhookSignature(string $rawBody, string $signatureHeader): bool
    {
        if (empty($this->webhookSecret)) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $this->webhookSecret);
        return hash_equals($expected, $signatureHeader);
    }

    /**
     * Parse and handle an incoming Swan webhook event.
     * Returns the event type and the updated SwanAccount (if applicable).
     */
    public function handleWebhookEvent(array $event): array
    {
        $eventType = $event['type'] ?? '';
        $result    = ['event_type' => $eventType, 'swan_account' => null];

        if (in_array($eventType, ['PaymentAccount.Opened', 'PaymentAccount.Suspended', 'PaymentAccount.Closed'])) {
            $accountData = $event['paymentAccount'] ?? [];
            $swanAccount = SwanAccount::where('swan_account_id', $accountData['id'] ?? '')->first();

            if ($swanAccount) {
                $swanAccount->update([
                    'status'       => $this->mapSwanStatus($accountData['statusInfo']['status'] ?? 'Pending'),
                    'iban'         => $accountData['IBAN'] ?? $swanAccount->iban,
                    'bic'          => $accountData['BIC'] ?? $swanAccount->bic,
                    'swan_payload' => $accountData,
                ]);
                $result['swan_account'] = $swanAccount->fresh();
            }
        }

        return $result;
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    protected function post(string $path, array $body): array
    {
        $response = Http::withToken($this->apiToken)
            ->timeout(30)
            ->post($this->apiUrl . $path, $body);

        if ($response->failed()) {
            Log::error('Swan API error', [
                'path'   => $path,
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
        }

        return $response->json() ?? [];
    }

    protected function mapSwanStatus(string $swanStatus): int
    {
        return match ($swanStatus) {
            'Opened'    => SwanAccount::STATUS_ACTIVE,
            'Suspended' => SwanAccount::STATUS_SUSPENDED,
            'Closed'    => SwanAccount::STATUS_CLOSED,
            default     => SwanAccount::STATUS_PENDING,
        };
    }
}
