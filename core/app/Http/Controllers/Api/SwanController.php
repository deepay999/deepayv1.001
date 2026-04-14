<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SwanAccount;
use App\Services\SwanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SwanController
 *
 * Handles Swan IBAN account provisioning and webhook events.
 * Routes:
 *   GET  swan/account           – get (or provision) the user's Swan IBAN account
 *   POST swan/account/refresh   – re-sync account details from Swan
 *   POST swan/webhook           – receive Swan webhook events (no auth middleware)
 */
class SwanController extends Controller
{
    public function __construct(protected SwanService $swan) {}

    /**
     * GET /api/swan/account
     *
     * Returns the user's dedicated Swan payment account, provisioning it if
     * it doesn't exist yet.  No fund pooling: each user owns their own IBAN.
     */
    public function account(): JsonResponse
    {
        $user        = auth()->user();
        $swanAccount = SwanAccount::where('user_id', $user->id)->first();

        if (!$swanAccount) {
            try {
                $swanAccount = $this->swan->provisionAccount($user);
            } catch (\Throwable $e) {
                return apiResponse('swan_provision_failed', 'error', [
                    'Unable to provision IBAN account: ' . $e->getMessage(),
                ]);
            }
        }

        return apiResponse('swan_account', 'success', ['IBAN account retrieved'], [
            'swan_account' => $this->formatAccount($swanAccount),
        ]);
    }

    /**
     * POST /api/swan/account/refresh
     *
     * Pulls the latest status / IBAN details from Swan.
     */
    public function refresh(): JsonResponse
    {
        $user        = auth()->user();
        $swanAccount = SwanAccount::where('user_id', $user->id)->firstOrFail();

        try {
            $swanAccount = $this->swan->refreshAccount($swanAccount);
        } catch (\Throwable $e) {
            return apiResponse('swan_refresh_failed', 'error', [
                'Failed to refresh account: ' . $e->getMessage(),
            ]);
        }

        return apiResponse('swan_account_refreshed', 'success', ['Account refreshed'], [
            'swan_account' => $this->formatAccount($swanAccount),
        ]);
    }

    /**
     * POST /api/swan/webhook
     *
     * Receives and processes Swan webhook events.
     * Must be excluded from auth middleware in the route definition.
     */
    public function webhook(Request $request): JsonResponse
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('Swan-Signature', '');

        if (!$this->swan->verifyWebhookSignature($rawBody, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event  = $request->json()->all();
        $result = $this->swan->handleWebhookEvent($event);

        return response()->json(['received' => true, 'event_type' => $result['event_type']]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function formatAccount(SwanAccount $account): array
    {
        return [
            'id'                  => $account->id,
            'iban'                => $account->iban,
            'bic'                 => $account->bic,
            'account_holder_name' => $account->account_holder_name,
            'currency'            => $account->currency,
            'status'              => $account->status,
            'is_active'           => $account->isActive(),
            'activated_at'        => $account->activated_at?->toIso8601String(),
        ];
    }
}
