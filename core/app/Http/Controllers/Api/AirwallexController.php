<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AirwallexPayout;
use App\Services\AirwallexService;
use App\Services\LedgerService;
use App\Services\RewardPointService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * AirwallexController
 *
 * Handles external payouts via Airwallex and incoming webhook events.
 * Routes:
 *   POST airwallex/payout          – initiate a new payout
 *   GET  airwallex/payouts         – list user's payouts
 *   GET  airwallex/payouts/{id}    – get single payout
 *   POST airwallex/payout/{id}/sync – re-sync status from Airwallex
 *   POST airwallex/webhook         – receive Airwallex webhook events (no auth)
 */
class AirwallexController extends Controller
{
    public function __construct(
        protected AirwallexService   $airwallex,
        protected LedgerService      $ledger,
        protected RewardPointService $rewards
    ) {}

    /**
     * POST /api/airwallex/payout
     */
    public function initiatePayout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount'                      => 'required|numeric|min:1',
            'currency'                    => 'required|string|size:3',
            'beneficiary_name'            => 'required|string|max:255',
            'beneficiary_account_number'  => 'required|string|max:64',
            'beneficiary_routing_number'  => 'nullable|string|max:64',
            'beneficiary_bank_name'       => 'nullable|string|max:255',
            'beneficiary_country'         => 'required|string|size:2',
            'payout_method'               => 'nullable|in:SWIFT,SEPA,LOCAL',
            'reference'                   => 'nullable|string|max:140',
        ]);

        if ($validator->fails()) {
            return apiResponse('validation_error', 'error', $validator->errors()->all());
        }

        $user   = auth()->user();
        $amount = (float) $request->amount;

        try {
            $payout = DB::transaction(function () use ($user, $amount, $request) {
                // 1. Debit the user's internal wallet first
                $this->ledger->debit(
                    $user,
                    $amount,
                    'payout',
                    "Payout to {$request->beneficiary_name} via Airwallex"
                );

                // 2. Create the payout record
                return AirwallexPayout::create([
                    'user_id'                    => $user->id,
                    'trx'                        => strtoupper(Str::random(16)),
                    'amount'                     => $amount,
                    'currency'                   => strtoupper($request->currency),
                    'beneficiary_name'           => $request->beneficiary_name,
                    'beneficiary_account_number' => $request->beneficiary_account_number,
                    'beneficiary_routing_number' => $request->beneficiary_routing_number,
                    'beneficiary_bank_name'      => $request->beneficiary_bank_name,
                    'beneficiary_country'        => strtoupper($request->beneficiary_country),
                    'payout_method'              => $request->payout_method ?? 'SEPA',
                    'reference'                  => $request->reference,
                    'status'                     => AirwallexPayout::STATUS_PENDING,
                ]);
            });

            // 3. Submit to Airwallex (outside DB transaction to avoid long locks)
            $payout = $this->airwallex->initiatePayout($payout);

            // 4. Award reward points
            $this->rewards->awardForPayout($user, $amount, $payout->trx);

            $notify[] = 'Payout initiated successfully';
            return apiResponse('payout_initiated', 'success', $notify, [
                'payout' => $this->formatPayout($payout),
            ]);
        } catch (\DomainException $e) {
            return apiResponse('payout_failed', 'error', [$e->getMessage()]);
        } catch (\Throwable $e) {
            return apiResponse('payout_error', 'error', ['An error occurred: ' . $e->getMessage()]);
        }
    }

    /**
     * GET /api/airwallex/payouts
     */
    public function listPayouts(): JsonResponse
    {
        $user    = auth()->user();
        $payouts = AirwallexPayout::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return apiResponse('payouts', 'success', ['Payouts retrieved'], [
            'payouts' => $payouts->through(fn($p) => $this->formatPayout($p)),
        ]);
    }

    /**
     * GET /api/airwallex/payouts/{id}
     */
    public function showPayout(int $id): JsonResponse
    {
        $user   = auth()->user();
        $payout = AirwallexPayout::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return apiResponse('payout_detail', 'success', ['Payout detail'], [
            'payout' => $this->formatPayout($payout),
        ]);
    }

    /**
     * POST /api/airwallex/payout/{id}/sync
     */
    public function syncPayout(int $id): JsonResponse
    {
        $user   = auth()->user();
        $payout = AirwallexPayout::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        try {
            $payout = $this->airwallex->syncPayoutStatus($payout);
        } catch (\Throwable $e) {
            return apiResponse('sync_failed', 'error', ['Sync error: ' . $e->getMessage()]);
        }

        return apiResponse('payout_synced', 'success', ['Payout status synced'], [
            'payout' => $this->formatPayout($payout),
        ]);
    }

    /**
     * POST /api/airwallex/webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('x-signature', '');

        if (!$this->airwallex->verifyWebhookSignature($rawBody, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event  = $request->json()->all();
        $result = $this->airwallex->handleWebhookEvent($event);

        // If payout completed, update ledger note (already debited on initiation)
        if ($result['payout'] && $result['payout']->isCompleted()) {
            // Nothing further needed for the ledger: the debit was already
            // recorded on initiation. Webhook confirms external settlement.
        }

        return response()->json(['received' => true]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function formatPayout(AirwallexPayout $payout): array
    {
        return [
            'id'                         => $payout->id,
            'trx'                        => $payout->trx,
            'airwallex_transfer_id'      => $payout->airwallex_transfer_id,
            'amount'                     => $payout->amount,
            'currency'                   => $payout->currency,
            'beneficiary_name'           => $payout->beneficiary_name,
            'beneficiary_account_number' => $payout->beneficiary_account_number,
            'beneficiary_bank_name'      => $payout->beneficiary_bank_name,
            'beneficiary_country'        => $payout->beneficiary_country,
            'payout_method'              => $payout->payout_method,
            'reference'                  => $payout->reference,
            'status'                     => $payout->status,
            'failure_reason'             => $payout->failure_reason,
            'submitted_at'               => $payout->submitted_at?->toIso8601String(),
            'completed_at'               => $payout->completed_at?->toIso8601String(),
            'created_at'                 => $payout->created_at?->toIso8601String(),
        ];
    }
}
