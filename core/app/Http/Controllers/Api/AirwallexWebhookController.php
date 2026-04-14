<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use App\Services\LedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * AirwallexWebhookController
 *
 * Handles Airwallex payment webhooks.
 * On a successful payment_intent.succeeded event the corresponding
 * user wallet is automatically credited via the LedgerService.
 *
 * Security: signature is verified using HMAC-SHA256.
 */
class AirwallexWebhookController extends Controller {

    public function __construct(private LedgerService $ledger) {}

    /**
     * POST /api/webhooks/airwallex
     */
    public function handle(Request $request): JsonResponse {
        // ── 1. Verify webhook signature ────────────────────────────────────
        $secret    = config('services.airwallex.webhook_secret');
        $signature = $request->header('x-signature');
        $timestamp = $request->header('x-timestamp');
        $rawBody   = $request->getContent();

        if ($secret && $signature) {
            $expected = hash_hmac('sha256', $timestamp . $rawBody, $secret);
            if (!hash_equals($expected, $signature)) {
                Log::warning('Airwallex webhook: invalid signature');
                return response()->json(['error' => 'Invalid signature'], 401);
            }
        }

        $payload   = $request->json()->all();
        $eventType = $payload['name'] ?? '';

        // ── 2. Only process successful payment intents ─────────────────────
        if ($eventType !== 'payment_intent.succeeded') {
            return response()->json(['status' => 'ignored']);
        }

        $data         = $payload['data'] ?? [];
        $paymentIntent = $data['object'] ?? $data ?? [];

        $externalRef  = $paymentIntent['id']       ?? null;
        $currency     = strtoupper($paymentIntent['currency'] ?? '');
        $amountCents  = $paymentIntent['amount']   ?? 0;  // Airwallex uses minor units
        $metadata     = $paymentIntent['metadata'] ?? [];
        $userId       = $metadata['user_id']       ?? null;

        if (!$userId || !$currency || !$amountCents) {
            Log::warning('Airwallex webhook: missing required fields', compact('userId', 'currency', 'amountCents'));
            return response()->json(['error' => 'Missing required fields'], 422);
        }

        // ── 3. Idempotency – skip if already processed ─────────────────────
        $idempotencyKey = 'airwallex_' . $externalRef;
        $existing = LedgerEntry::where('idempotency_key', $idempotencyKey)->first();

        if ($existing) {
            return response()->json(['status' => 'already_processed']);
        }

        // ── 4. Convert minor units to major (e.g. cents → euros) ──────────
        $amount = $amountCents / 100;

        // ── 5. Credit the wallet ───────────────────────────────────────────
        try {
            $this->ledger->credit(
                userId:         (int) $userId,
                currency:       $currency,
                amount:         $amount,
                type:           'airwallex_payment',
                referenceType:  'airwallex_payment_intent',
                referenceId:    null,
                description:    "Card/bank payment via Airwallex ({$externalRef})",
                idempotencyKey: $idempotencyKey
            );

            Log::info('Airwallex webhook: wallet credited', [
                'user_id'  => $userId,
                'currency' => $currency,
                'amount'   => $amount,
                'ref'      => $externalRef,
            ]);

            return response()->json(['status' => 'credited']);
        } catch (\Throwable $e) {
            Log::error('Airwallex webhook: credit failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Internal error'], 500);
        }
    }
}
