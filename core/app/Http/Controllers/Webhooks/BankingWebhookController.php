<?php

namespace App\Http\Controllers\Webhooks;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\FinancialWebhookEvent;
use App\Models\Gateway;
use App\Services\Finance\DepositSettlementService;
use App\Services\Finance\Webhooks\BankingWebhookSupport;
use App\Services\Finance\Webhooks\FinancialWebhookEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class BankingWebhookController extends Controller
{
    public function __construct(
        private DepositSettlementService $depositSettlementService,
        private BankingWebhookSupport $webhookSupport,
        private FinancialWebhookEventService $financialWebhookEventService
    ) {
    }

    public function swan(Request $request): JsonResponse
    {
        return $this->handleWebhook(
            request: $request,
            provider: 'swan',
            gatewayAlias: 'Swan',
            defaultSignatureHeader: 'X-Swan-Signature',
            referenceKeys: ['externalReference', 'reference', 'trx'],
            statusKeys: ['status', 'statusInfo', '__typename', 'eventType'],
            eventIdKeys: ['eventId', 'id'],
            timestampKeys: ['timestamp', 'createdAt', 'created_at', 'occurredAt'],
            defaultSuccessStatuses: 'MerchantPaymentCaptured,MerchantPaymentAuthorized',
            signatureMode: 'body_only'
        );
    }

    public function airwallex(Request $request): JsonResponse
    {
        return $this->handleWebhook(
            request: $request,
            provider: 'airwallex',
            gatewayAlias: 'Airwallex',
            defaultSignatureHeader: 'x-signature',
            referenceKeys: ['merchant_order_id', 'request_id', 'reference', 'trx'],
            statusKeys: ['status'],
            eventIdKeys: ['id'],
            timestampKeys: ['created_at'],
            defaultSuccessStatuses: 'SUCCEEDED,SUCCESS,SETTLED',
            signatureMode: 'timestamp_prefix'
        );
    }

    private function handleWebhook(
        Request $request,
        string $provider,
        string $gatewayAlias,
        string $defaultSignatureHeader,
        array $referenceKeys,
        array $statusKeys,
        array $eventIdKeys,
        array $timestampKeys,
        string $defaultSuccessStatuses,
        string $signatureMode = 'body_only'
    ): JsonResponse {
        $gateway = Gateway::query()->where('alias', $gatewayAlias)->first();
        if (!$gateway) {
            return response()->json(['message' => $gatewayAlias . ' gateway not configured'], Response::HTTP_NOT_FOUND);
        }

        $parameters = json_decode($gateway->gateway_parameters ?? '{}');
        $payload = $request->json()->all() ?: $request->all();
        $status = $this->webhookSupport->extractReference($payload, $statusKeys);
        $eventId = $this->webhookSupport->extractReference($payload, $eventIdKeys);
        $eventTimestamp = $this->webhookSupport->extractTimestamp($payload, $timestampKeys);
        $signatureValid = $this->verifySignature($request, $parameters, $defaultSignatureHeader, $signatureMode);
        $registeredEvent = $this->financialWebhookEventService->register(
            $provider,
            $eventId,
            $status,
            $signatureValid,
            $eventTimestamp,
            $payload
        );
        $eventRecord = $registeredEvent['record'];

        if ($registeredEvent['hash_mismatch']) {
            $this->financialWebhookEventService->markRejected($eventRecord, 'Webhook event replay detected with mismatched payload');

            return response()->json(['message' => 'Webhook event payload mismatch'], Response::HTTP_CONFLICT);
        }

        if (!$signatureValid) {
            $this->financialWebhookEventService->markRejected($eventRecord, 'Invalid webhook signature');

            return response()->json(['message' => 'Invalid webhook signature'], Response::HTTP_UNAUTHORIZED);
        }

        if ($registeredEvent['duplicate']) {
            return response()->json(['message' => 'Webhook already recorded'], Response::HTTP_ACCEPTED);
        }

        $maxSkewSeconds = (int) config('finance.webhooks.max_skew_seconds', 300);
        if (!$this->webhookSupport->isFresh($eventTimestamp, $maxSkewSeconds)) {
            $this->financialWebhookEventService->markRejected($eventRecord, 'Webhook timestamp outside allowed skew window');

            return response()->json(['message' => 'Webhook timestamp outside allowed skew window'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reference = $this->webhookSupport->extractReference($payload, $referenceKeys);
        $successStates = $this->webhookSupport->resolveSuccessStates($parameters, 'webhook_success_statuses', $defaultSuccessStatuses);

        return $this->settleSuccessfulDepositIfMatched($provider, $reference, $status, $successStates, $payload, $eventRecord);
    }

    private function settleSuccessfulDepositIfMatched(
        string $provider,
        ?string $reference,
        ?string $status,
        array $successStates,
        array $payload,
        FinancialWebhookEvent $eventRecord
    ): JsonResponse
    {
        if (!$reference) {
            $this->financialWebhookEventService->markIgnored($eventRecord, null, null, 'Reference not found');

            return response()->json(['message' => 'Reference not found'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$status || !in_array($status, $successStates, true)) {
            $this->financialWebhookEventService->markIgnored($eventRecord, null, null, 'Webhook accepted without settlement');

            return response()->json(['message' => 'Webhook accepted without settlement'], Response::HTTP_ACCEPTED);
        }

        $deposit = Deposit::query()
            ->where('trx', $reference)
            ->whereIn('status', [Status::PAYMENT_INITIATE, Status::PAYMENT_PENDING])
            ->latest('id')
            ->first();

        if (!$deposit) {
            $this->financialWebhookEventService->markIgnored($eventRecord, Deposit::class, null, 'Deposit not found or already settled');

            return response()->json(['message' => 'Deposit not found or already settled'], Response::HTTP_ACCEPTED);
        }

        try {
            $this->depositSettlementService->settle($deposit, false, [
                'external_reference' => $reference,
                'event_type' => 'deposit.posted',
                'settlement_event_type' => 'deposit.settlement.clearing',
                'metadata' => [
                    'provider' => $provider,
                    'provider_event_id' => $eventRecord->event_id,
                    'provider_status' => $status,
                    'provider_payload' => $payload,
                ],
            ]);
        } catch (Throwable $exception) {
            $this->financialWebhookEventService->markRejected($eventRecord, 'Settlement failed: ' . $exception->getMessage());

            return response()->json(['message' => 'Settlement processing error'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $this->financialWebhookEventService->markSucceeded($eventRecord, Deposit::class, $deposit->id);

        return response()->json(['message' => 'Deposit settled'], Response::HTTP_OK);
    }

    private function verifySignature(Request $request, object $parameters, string $defaultHeader, string $mode = 'body_only'): bool
    {
        $secret = $this->webhookSupport->parameterValue($parameters, 'webhook_secret');
        if (!is_string($secret) || trim($secret) === '') {
            return true;
        }

        $headerName = (string) $this->webhookSupport->parameterValue($parameters, 'webhook_signature_header', $defaultHeader);
        $signature = $request->header($headerName);

        if (!$signature) {
            return false;
        }

        $body = (string) $request->getContent();

        if ($mode === 'timestamp_prefix') {
            $timestamp = $request->header('x-timestamp', '');
            $computed = hash_hmac('sha256', $timestamp . $body, $secret);
        } else {
            $computed = hash_hmac('sha256', $body, $secret);
        }

        return hash_equals($computed, (string) $signature);
    }
}