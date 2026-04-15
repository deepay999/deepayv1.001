<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeepayController extends Controller
{
    /**
     * GET /api/dashboard/overview
     * Returns total balance, currency, today inflows and outflows.
     */
    public function overview(): JsonResponse
    {
        $user = auth()->user()->makeVisible('balance');

        $today = now()->toDateString();

        $todayIn = Transaction::where('user_id', $user->id)
            ->whereDate('created_at', $today)
            ->where('trx_type', '+')
            ->sum('amount');

        $todayOut = Transaction::where('user_id', $user->id)
            ->whereDate('created_at', $today)
            ->where('trx_type', '-')
            ->sum('amount');

        return response()->json([
            'total_balance' => round((float) $user->balance, 2),
            'currency'      => 'EUR',
            'today_in'      => round((float) $todayIn, 2),
            'today_out'     => round((float) $todayOut, 2),
        ]);
    }

    /**
     * GET /api/wallets
     * Returns available and frozen balances per supported currency.
     */
    public function wallets(): JsonResponse
    {
        $user = auth()->user()->makeVisible('balance');

        // Core balance is stored in EUR; other currencies use static allocation.
        $eurBalance = round((float) $user->balance, 2);

        return response()->json([
            [
                'currency'  => 'EUR',
                'available' => $eurBalance,
                'frozen'    => 0.00,
            ],
            [
                'currency'  => 'USD',
                'available' => 0.00,
                'frozen'    => 0.00,
            ],
            [
                'currency'  => 'GBP',
                'available' => 0.00,
                'frozen'    => 0.00,
            ],
        ]);
    }

    /**
     * POST /api/transfer
     * Internal peer-to-peer transfer.
     *
     * Body: { to_user_id, amount, currency }
     */
    public function transfer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'to_user_id' => 'required',
            'amount'     => 'required|numeric|min:0.01',
            'currency'   => 'required|in:EUR,USD,GBP',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->all()], 422);
        }

        $sender = auth()->user()->makeVisible('balance');

        // Resolve recipient by id or username/email
        $recipient = User::where('id', $request->to_user_id)
            ->orWhere('username', $request->to_user_id)
            ->orWhere('email', $request->to_user_id)
            ->first();

        if (!$recipient) {
            return response()->json(['error' => 'Recipient not found.'], 404);
        }

        if ($recipient->id === $sender->id) {
            return response()->json(['error' => 'Cannot transfer to yourself.'], 422);
        }

        $amount = round((float) $request->amount, 2);

        if ((float) $sender->balance < $amount) {
            return response()->json(['error' => 'Insufficient balance.'], 422);
        }

        // Deduct from sender
        $sender->balance = bcsub((string) $sender->balance, (string) $amount, 8);
        $sender->save();

        // Credit recipient
        $recipient->balance = bcadd((string) $recipient->balance, (string) $amount, 8);
        $recipient->save();

        // Record sender transaction
        $senderTrx = new Transaction();
        $senderTrx->user_id     = $sender->id;
        $senderTrx->amount      = $amount;
        $senderTrx->post_balance = $sender->balance;
        $senderTrx->charge      = 0;
        $senderTrx->trx_type    = '-';
        $senderTrx->trx         = getTrx();
        $senderTrx->details     = "Transfer to {$recipient->username}";
        $senderTrx->remark      = 'transfer';
        $senderTrx->save();

        // Record recipient transaction
        $recipientTrx = new Transaction();
        $recipientTrx->user_id      = $recipient->id;
        $recipientTrx->amount       = $amount;
        $recipientTrx->post_balance = $recipient->balance;
        $recipientTrx->charge       = 0;
        $recipientTrx->trx_type     = '+';
        $recipientTrx->trx          = $senderTrx->trx;
        $recipientTrx->details      = "Transfer from {$sender->username}";
        $recipientTrx->remark       = 'transfer';
        $recipientTrx->save();

        return response()->json([
            'status'      => 'success',
            'transfer_id' => $senderTrx->trx,
        ]);
    }

    /**
     * GET /api/iban
     * Returns IBAN / BIC details for the authenticated user.
     * These values come from the Swan integration stored in user meta.
     */
    public function iban(): JsonResponse
    {
        $user = auth()->user()->makeVisible('balance');

        // Retrieve stored IBAN data, or return placeholder if not yet provisioned.
        $ibanData = $user->swan_iban ?? null;

        if ($ibanData) {
            return response()->json([
                'iban'    => $ibanData['iban']    ?? '',
                'bic'     => $ibanData['bic']     ?? 'SWNBFRPP',
                'balance' => round((float) ($ibanData['balance'] ?? $user->balance), 2),
            ]);
        }

        return response()->json([
            'iban'    => '',
            'bic'     => 'SWNBFRPP',
            'balance' => round((float) $user->balance, 2),
        ]);
    }

    /**
     * GET /api/iban/transactions
     * Returns recent incoming SEPA transactions on the IBAN account.
     */
    public function ibanTransactions(): JsonResponse
    {
        $user = auth()->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->where('remark', 'add_money')
            ->where('trx_type', '+')
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($tx) {
                return [
                    'id'          => $tx->id,
                    'type'        => 'credit',
                    'amount'      => round((float) $tx->amount, 2),
                    'description' => $tx->details ?? 'Incoming SEPA',
                    'date'        => $tx->created_at->toDateString(),
                ];
            });

        return response()->json($transactions);
    }

    /**
     * POST /api/payments/create
     * Create an Airwallex payment / payment link.
     *
     * Body: { amount, currency }
     */
    public function createPayment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount'   => 'required|numeric|min:0.01',
            'currency' => 'required|in:EUR,USD,GBP',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->all()], 422);
        }

        $paymentId = 'PAY' . strtoupper(uniqid());

        // TODO: integrate with Airwallex SDK to create a real payment intent.
        return response()->json([
            'payment_link' => url('/pay/' . $paymentId),
            'payment_id'   => $paymentId,
            'status'       => 'pending',
        ]);
    }

    /**
     * POST /api/webhooks/airwallex
     * Handle Airwallex payment webhook — credits wallet on successful payment.
     */
    public function airwallexWebhook(Request $request): JsonResponse
    {
        // TODO: verify Airwallex webhook signature before processing.
        $event  = $request->input('event_type');
        $data   = $request->input('data', []);
        $status = $data['status'] ?? null;

        if ($event !== 'payment_intent.succeeded' || $status !== 'SUCCEEDED') {
            return response()->json(['received' => true]);
        }

        $paymentIntentId = $data['id'] ?? null;
        $amount          = round((float) ($data['amount'] ?? 0), 2);
        $currency        = strtoupper($data['currency'] ?? 'EUR');
        $userId          = $data['metadata']['user_id'] ?? null;

        if (!$userId || $amount <= 0) {
            return response()->json(['received' => true]);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['received' => true]);
        }

        // Credit wallet
        $user->balance = bcadd((string) $user->balance, (string) $amount, 8);
        $user->save();

        // Write ledger entry
        $tx = new Transaction();
        $tx->user_id      = $user->id;
        $tx->amount       = $amount;
        $tx->post_balance = $user->balance;
        $tx->charge       = 0;
        $tx->trx_type     = '+';
        $tx->trx          = $paymentIntentId ?? getTrx();
        $tx->details      = "Airwallex payment received ({$currency})";
        $tx->remark       = 'add_money';
        $tx->save();

        return response()->json(['received' => true]);
    }

    /**
     * POST /api/withdraw
     * Initiate a withdrawal via Swan or another method.
     *
     * Body: { amount, currency, method }
     */
    public function withdraw(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount'   => 'required|numeric|min:0.01',
            'currency' => 'required|in:EUR,USD,GBP',
            'method'   => 'required|in:swan,bank_transfer',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->all()], 422);
        }

        $user   = auth()->user()->makeVisible('balance');
        $amount = round((float) $request->amount, 2);

        if ((float) $user->balance < $amount) {
            return response()->json(['error' => 'Insufficient balance.'], 422);
        }

        // Deduct balance immediately and mark as processing
        $user->balance = bcsub((string) $user->balance, (string) $amount, 8);
        $user->save();

        $withdrawId = 'WD' . strtoupper(uniqid());

        $tx = new Transaction();
        $tx->user_id      = $user->id;
        $tx->amount       = $amount;
        $tx->post_balance = $user->balance;
        $tx->charge       = 0;
        $tx->trx_type     = '-';
        $tx->trx          = $withdrawId;
        $tx->details      = "Withdrawal via {$request->method} ({$request->currency})";
        $tx->remark       = 'withdraw';
        $tx->save();

        // TODO: trigger Swan / bank transfer API call here.

        return response()->json([
            'status'      => 'processing',
            'withdraw_id' => $withdrawId,
        ]);
    }

    /**
     * GET /api/transactions
     * Returns paginated transaction history for the authenticated user.
     */
    public function transactions(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = Transaction::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($tx) {
                $type = match ($tx->remark) {
                    'transfer'   => 'transfer',
                    'withdraw'   => 'withdraw',
                    'add_money'  => 'credit',
                    default      => $tx->trx_type === '+' ? 'credit' : 'debit',
                };

                return [
                    'id'          => $tx->id,
                    'type'        => $type,
                    'amount'      => round((float) $tx->amount, 2),
                    'description' => $tx->details ?? ucfirst($tx->remark ?? 'Transaction'),
                    'date'        => $tx->created_at->toDateString(),
                ];
            });

        return response()->json($query);
    }
}
