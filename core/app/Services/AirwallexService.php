<?php

namespace App\Services;

use App\Models\AirwallexPayout;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * AirwallexService
 *
 * Handles payments and payouts via the Airwallex API.
 * Each payout is initiated on behalf of the individual user – no pooled accounts.
 *
 * Required env vars:
 *   AIRWALLEX_API_URL        – e.g. https://api.airwallex.com
 *   AIRWALLEX_CLIENT_ID      – Airwallex client ID
 *   AIRWALLEX_API_KEY        – Airwallex API key (for M2M token exchange)
 *   AIRWALLEX_WEBHOOK_SECRET – Secret for webhook signature verification
 */
class AirwallexService
{
    protected string $apiUrl;
    protected string $clientId;
    protected string $apiKey;
    protected string $webhookSecret;

    protected ?string $cachedToken = null;
    protected ?int $tokenExpiresAt = null;

    public function __construct()
    {
        $this->apiUrl        = rtrim(config('services.airwallex.api_url', 'https://api.airwallex.com'), '/');
        $this->clientId      = config('services.airwallex.client_id', '');
        $this->apiKey        = config('services.airwallex.api_key', '');
        $this->webhookSecret = config('services.airwallex.webhook_secret', '');
    }

    // -------------------------------------------------------------------------
    // Payout initiation
    // -------------------------------------------------------------------------

    /**
     * Initiate an external payout for the given AirwallexPayout record.
     * Returns the updated AirwallexPayout model.
     */
    public function initiatePayout(AirwallexPayout $payout): AirwallexPayout
    {
        $token = $this->getAccessToken();

        $body = [
            'request_id'    => $payout->trx,
            'amount'        => round($payout->amount, 2),
            'currency'      => $payout->currency,
            'payout_method' => strtolower($payout->payout_method),
            'beneficiary'   => [
                'name'           => $payout->beneficiary_name,
                'bank_details'   => [
                    'account_number'  => $payout->beneficiary_account_number,
                    'routing_number'  => $payout->beneficiary_routing_number,
                    'bank_name'       => $payout->beneficiary_bank_name,
                    'bank_country_code' => $payout->beneficiary_country,
                ],
            ],
            'reference'     => $payout->reference ?? $payout->trx,
        ];

        $response = Http::withToken($token)
            ->timeout(30)
            ->post("{$this->apiUrl}/api/v1/payouts/create", $body);

        $responseData = $response->json() ?? [];

        if ($response->successful()) {
            $payout->update([
                'airwallex_transfer_id' => $responseData['id'] ?? null,
                'status'                => AirwallexPayout::STATUS_PROCESSING,
                'airwallex_payload'     => $responseData,
                'submitted_at'          => now(),
            ]);
        } else {
            Log::error('Airwallex payout initiation failed', [
                'payout_id' => $payout->id,
                'status'    => $response->status(),
                'body'      => $response->body(),
            ]);

            $payout->update([
                'status'            => AirwallexPayout::STATUS_FAILED,
                'failure_reason'    => $responseData['message'] ?? 'Unknown error',
                'airwallex_payload' => $responseData,
            ]);
        }

        return $payout->fresh();
    }

    /**
     * Retrieve payout status from Airwallex and sync to local record.
     */
    public function syncPayoutStatus(AirwallexPayout $payout): AirwallexPayout
    {
        if (empty($payout->airwallex_transfer_id)) {
            return $payout;
        }

        $token    = $this->getAccessToken();
        $response = Http::withToken($token)
            ->timeout(30)
            ->get("{$this->apiUrl}/api/v1/payouts/{$payout->airwallex_transfer_id}");

        $responseData = $response->json() ?? [];

        if ($response->successful()) {
            $status = $this->mapAirwallexStatus($responseData['status'] ?? '');
            $payout->update([
                'status'            => $status,
                'airwallex_payload' => $responseData,
                'completed_at'      => $status === AirwallexPayout::STATUS_COMPLETED ? now() : $payout->completed_at,
                'failure_reason'    => $responseData['error_message'] ?? $payout->failure_reason,
            ]);
        }

        return $payout->fresh();
    }

    // -------------------------------------------------------------------------
    // Webhook
    // -------------------------------------------------------------------------

    /**
     * Verify the Airwallex webhook signature (HMAC-SHA256).
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
     * Handle an incoming Airwallex webhook event.
     * Returns the updated AirwallexPayout model if one was matched.
     */
    public function handleWebhookEvent(array $event): array
    {
        $eventName    = $event['name'] ?? '';
        $eventData    = $event['data']['object'] ?? [];
        $result       = ['event_name' => $eventName, 'payout' => null];
        $transferId   = $eventData['id'] ?? null;

        if (!$transferId) {
            return $result;
        }

        $payout = AirwallexPayout::where('airwallex_transfer_id', $transferId)->first();
        if (!$payout) {
            return $result;
        }

        $status = $this->mapAirwallexStatus($eventData['status'] ?? '');
        $payout->update([
            'status'            => $status,
            'airwallex_payload' => array_merge($payout->airwallex_payload ?? [], $eventData),
            'completed_at'      => $status === AirwallexPayout::STATUS_COMPLETED ? now() : $payout->completed_at,
            'failure_reason'    => $eventData['error_message'] ?? $payout->failure_reason,
        ]);

        $result['payout'] = $payout->fresh();
        return $result;
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    protected function getAccessToken(): string
    {
        if ($this->cachedToken && $this->tokenExpiresAt && time() < $this->tokenExpiresAt - 60) {
            return $this->cachedToken;
        }

        $response = Http::withHeaders([
            'x-client-id' => $this->clientId,
            'x-api-key'   => $this->apiKey,
        ])->post("{$this->apiUrl}/api/v1/authentication/login");

        $data = $response->json() ?? [];

        if (empty($data['token'])) {
            throw new \RuntimeException('Failed to obtain Airwallex access token');
        }

        $this->cachedToken    = $data['token'];
        $this->tokenExpiresAt = time() + ($data['expires_in'] ?? 1800);

        return $this->cachedToken;
    }

    protected function mapAirwallexStatus(string $airwallexStatus): int
    {
        return match (strtolower($airwallexStatus)) {
            'submitted', 'processing' => AirwallexPayout::STATUS_PROCESSING,
            'succeeded', 'paid'       => AirwallexPayout::STATUS_COMPLETED,
            'failed', 'rejected'      => AirwallexPayout::STATUS_FAILED,
            'cancelled'               => AirwallexPayout::STATUS_CANCELLED,
            default                   => AirwallexPayout::STATUS_PENDING,
        };
    }
}
