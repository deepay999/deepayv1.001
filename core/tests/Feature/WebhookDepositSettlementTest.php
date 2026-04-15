<?php

namespace Tests\Feature;

use App\Constants\Status;
use App\Models\Deposit;
use App\Models\FinancialWebhookEvent;
use App\Models\Gateway;
use App\Models\LedgerEntry;
use App\Models\LedgerTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WalletBalance;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class WebhookDepositSettlementTest extends TestCase
{
    use DatabaseTransactions;

    private string $webhookSecret = 'test-webhook-secret-key';

    protected function setUp(): void
    {
        parent::setUp();
        Model::unguard();
    }

    protected function tearDown(): void
    {
        Model::reguard();
        parent::tearDown();
    }

    public function test_swan_webhook_settles_deposit_end_to_end(): void
    {
        Notification::fake();
        Cache::flush();

        // --- Arrange: seed minimal data ---
        $user = User::query()->create([
            'firstname' => 'Test',
            'lastname' => 'User',
            'username' => 'testuser_' . uniqid(),
            'email' => 'test_' . uniqid() . '@deepay.test',
            'password' => bcrypt('password'),
            'balance' => 0,
            'status' => 1,
            'ev' => 1,
            'sv' => 1,
            'ts' => 0,
            'tv' => 1,
            'en' => 0,
            'sn' => 0,
            'pn' => 0,
        ]);

        $gateway = Gateway::query()->create([
            'name' => 'Swan',
            'alias' => 'Swan',
            'code' => 9990 + rand(1, 999),
            'status' => 1,
            'gateway_parameters' => json_encode([
                'webhook_secret' => [
                    'title' => 'Webhook Secret',
                    'global' => true,
                    'value' => $this->webhookSecret,
                ],
                'webhook_success_statuses' => [
                    'title' => 'Success Statuses',
                    'global' => true,
                    'value' => 'MerchantPaymentCaptured,MerchantPaymentAuthorized',
                ],
            ]),
        ]);

        $deposit = Deposit::query()->create([
            'user_id' => $user->id,
            'agent_id' => 0,
            'merchant_id' => 0,
            'method_code' => $gateway->code,
            'amount' => '100.00000000',
            'method_currency' => 'EUR',
            'charge' => '0.00000000',
            'rate' => '1.00000000',
            'final_amount' => '100.00000000',
            'trx' => 'TRX' . strtoupper(uniqid()),
            'status' => Status::PAYMENT_INITIATE,
        ]);

        // --- Build webhook payload ---
        $payload = [
            'eventId' => 'swan-evt-' . uniqid(),
            'status' => 'MerchantPaymentCaptured',
            'externalReference' => $deposit->trx,
            'timestamp' => now()->toIso8601String(),
            'amount' => ['value' => '100.00', 'currency' => 'EUR'],
        ];
        $body = json_encode($payload);
        $signature = hash_hmac('sha256', $body, $this->webhookSecret);

        // --- Act: send the webhook ---
        $response = $this->postJson('/webhooks/swan', $payload, [
            'X-Swan-Signature' => $signature,
        ]);

        // --- Assert: HTTP 200 ---
        $response->assertOk();
        $response->assertJson(['message' => 'Deposit settled']);

        // --- Assert: FinancialWebhookEvent persisted ---
        $event = FinancialWebhookEvent::query()
            ->where('provider', 'swan')
            ->where('event_id', $payload['eventId'])
            ->first();

        $this->assertNotNull($event, 'Webhook event should be persisted');
        $this->assertSame('succeeded', $event->processing_status);
        $this->assertTrue($event->signature_valid);
        $this->assertSame(Deposit::class, $event->linked_reference_type);
        $this->assertSame($deposit->id, $event->linked_reference_id);

        // --- Assert: Deposit settled ---
        $deposit->refresh();
        $this->assertSame(Status::PAYMENT_SUCCESS, (int) $deposit->status);

        // --- Assert: Ledger entries created (double-entry) ---
        $ledgerTx = LedgerTransaction::query()
            ->where('event_type', 'wallet.deposit.settle')
            ->where('idempotency_key', 'deposit:settlement:' . $deposit->trx)
            ->first();

        $this->assertNotNull($ledgerTx, 'LedgerTransaction should exist');

        $entries = LedgerEntry::query()
            ->where('ledger_transaction_id', $ledgerTx->id)
            ->get();

        $this->assertCount(2, $entries, 'Exactly 2 ledger entries (double-entry)');

        $debitEntry = $entries->firstWhere('entry_side', 'debit');
        $creditEntry = $entries->firstWhere('entry_side', 'credit');

        $this->assertNotNull($debitEntry);
        $this->assertNotNull($creditEntry);
        $this->assertSame('100.00000000', $debitEntry->amount);
        $this->assertSame('100.00000000', $creditEntry->amount);

        // --- Assert: WalletBalance projection updated ---
        $walletBalance = WalletBalance::query()
            ->where('account_type', 'user')
            ->where('owner_id', $user->id)
            ->where('currency', 'EUR')
            ->first();

        $this->assertNotNull($walletBalance, 'WalletBalance projection should exist');
        $this->assertSame('100.00000000', $walletBalance->available_balance);

        // --- Assert: User balance synced ---
        $user->refresh();
        $this->assertEquals(100.0, $user->balance);

        // --- Assert: Transaction record ---
        $transaction = Transaction::query()
            ->where('trx', $deposit->trx)
            ->where('remark', 'add_money')
            ->first();

        $this->assertNotNull($transaction, 'Transaction record should exist');
        $this->assertSame('+', $transaction->trx_type);
    }

    public function test_duplicate_webhook_returns_202_without_double_settlement(): void
    {
        Notification::fake();
        Cache::flush();

        $user = User::query()->create([
            'firstname' => 'Test',
            'lastname' => 'Dup',
            'username' => 'testdup_' . uniqid(),
            'email' => 'dup_' . uniqid() . '@deepay.test',
            'password' => bcrypt('password'),
            'balance' => 0,
            'status' => 1,
            'ev' => 1,
            'sv' => 1,
            'ts' => 0,
            'tv' => 1,
            'en' => 0,
            'sn' => 0,
            'pn' => 0,
        ]);

        $gateway = Gateway::query()->create([
            'name' => 'Swan',
            'alias' => 'Swan',
            'code' => 8880 + rand(1, 999),
            'status' => 1,
            'gateway_parameters' => json_encode([
                'webhook_secret' => ['title' => 'Webhook Secret', 'global' => true, 'value' => $this->webhookSecret],
                'webhook_success_statuses' => ['title' => 'Success Statuses', 'global' => true, 'value' => 'MerchantPaymentCaptured'],
            ]),
        ]);

        $deposit = Deposit::query()->create([
            'user_id' => $user->id,
            'agent_id' => 0,
            'merchant_id' => 0,
            'method_code' => $gateway->code,
            'amount' => '50.00000000',
            'method_currency' => 'EUR',
            'charge' => '0.00000000',
            'rate' => '1.00000000',
            'final_amount' => '50.00000000',
            'trx' => 'TRXDUP' . strtoupper(uniqid()),
            'status' => Status::PAYMENT_INITIATE,
        ]);

        $eventId = 'swan-dup-' . uniqid();
        $payload = [
            'eventId' => $eventId,
            'status' => 'MerchantPaymentCaptured',
            'externalReference' => $deposit->trx,
            'timestamp' => now()->toIso8601String(),
        ];
        $body = json_encode($payload);
        $signature = hash_hmac('sha256', $body, $this->webhookSecret);

        // First call → settles
        $first = $this->postJson('/webhooks/swan', $payload, ['X-Swan-Signature' => $signature]);
        $first->assertOk();

        // Second call (replay) → 202 Accepted, no double settlement
        $second = $this->postJson('/webhooks/swan', $payload, ['X-Swan-Signature' => $signature]);
        $second->assertStatus(202);
        $second->assertJson(['message' => 'Webhook already recorded']);

        // Only 1 ledger transaction
        $ledgerCount = LedgerTransaction::query()
            ->where('idempotency_key', 'deposit:settlement:' . $deposit->trx)
            ->count();
        $this->assertSame(1, $ledgerCount, 'Replay must not create duplicate ledger entries');
    }

    public function test_invalid_signature_returns_401(): void
    {
        Cache::flush();

        $gateway = Gateway::query()->create([
            'name' => 'Swan',
            'alias' => 'Swan',
            'code' => 7770 + rand(1, 999),
            'status' => 1,
            'gateway_parameters' => json_encode([
                'webhook_secret' => ['title' => 'Webhook Secret', 'global' => true, 'value' => $this->webhookSecret],
            ]),
        ]);

        $payload = ['eventId' => 'fake-evt', 'status' => 'MerchantPaymentCaptured', 'externalReference' => 'TRX999'];
        $badSignature = 'definitely-wrong-signature';

        $response = $this->postJson('/webhooks/swan', $payload, ['X-Swan-Signature' => $badSignature]);
        $response->assertUnauthorized();

        $event = FinancialWebhookEvent::query()
            ->where('provider', 'swan')
            ->where('event_id', 'fake-evt')
            ->first();

        $this->assertNotNull($event);
        $this->assertSame('rejected', $event->processing_status);
        $this->assertFalse((bool) $event->signature_valid);
    }

    public function test_airwallex_webhook_settles_deposit_with_real_payload_format(): void
    {
        Notification::fake();
        Cache::flush();
        Gateway::query()->where('alias', 'Airwallex')->delete();

        $user = User::query()->create([
            'firstname' => 'Airwallex',
            'lastname' => 'Test',
            'username' => 'awxtest_' . uniqid(),
            'email' => 'awx_' . uniqid() . '@deepay.test',
            'password' => bcrypt('password'),
            'balance' => 0,
            'status' => 1,
            'ev' => 1, 'sv' => 1, 'ts' => 0, 'tv' => 1,
            'en' => 0, 'sn' => 0, 'pn' => 0,
        ]);

        $gateway = Gateway::query()->create([
            'name' => 'Airwallex',
            'alias' => 'Airwallex',
            'code' => 6660 + rand(1, 999),
            'status' => 1,
            'gateway_parameters' => json_encode([
                'client_id' => ['title' => 'Client ID', 'global' => true, 'value' => 'test-client'],
                'api_key' => ['title' => 'API Key', 'global' => true, 'value' => 'test-api-key'],
                'api_url' => ['title' => 'API URL', 'global' => true, 'value' => 'https://api-demo.airwallex.com/api/v1'],
                'webhook_secret' => ['title' => 'Webhook Secret', 'global' => true, 'value' => $this->webhookSecret],
                'webhook_signature_header' => ['title' => 'Signature Header', 'global' => true, 'value' => 'x-signature'],
                'webhook_success_statuses' => ['title' => 'Success Statuses', 'global' => true, 'value' => 'SUCCEEDED,SUCCESS,SETTLED'],
            ]),
        ]);

        $deposit = Deposit::query()->create([
            'user_id' => $user->id,
            'agent_id' => 0,
            'merchant_id' => 0,
            'method_code' => $gateway->code,
            'amount' => '250.00000000',
            'method_currency' => 'EUR',
            'charge' => '0.00000000',
            'rate' => '1.00000000',
            'final_amount' => '250.00000000',
            'trx' => 'AWXTRX' . strtoupper(uniqid()),
            'status' => Status::PAYMENT_INITIATE,
        ]);

        // Real Airwallex webhook payload structure
        $timestamp = (string) now()->timestamp;
        $payload = [
            'id' => 'evt_' . uniqid('awx_'),
            'name' => 'payment_intent.succeeded',
            'account_id' => 'acct_m_test123',
            'created_at' => now()->toIso8601String(),
            'data' => [
                'object' => [
                    'id' => 'int_test_' . uniqid(),
                    'status' => 'SUCCEEDED',
                    'merchant_order_id' => $deposit->trx,
                    'amount' => 250.00,
                    'currency' => 'EUR',
                    'request_id' => 'req_' . uniqid(),
                ],
            ],
        ];

        $body = json_encode($payload);
        // Airwallex signature = HMAC-SHA256(timestamp + body, secret)
        $signature = hash_hmac('sha256', $timestamp . $body, $this->webhookSecret);

        $response = $this->postJson('/webhooks/airwallex', $payload, [
            'x-signature' => $signature,
            'x-timestamp' => $timestamp,
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Deposit settled']);

        // Verify event stored
        $event = FinancialWebhookEvent::query()
            ->where('provider', 'airwallex')
            ->where('event_id', $payload['id'])
            ->first();

        $this->assertNotNull($event);
        $this->assertSame('succeeded', $event->processing_status);
        $this->assertTrue($event->signature_valid);

        // Verify deposit settled
        $deposit->refresh();
        $this->assertSame(Status::PAYMENT_SUCCESS, (int) $deposit->status);

        // Verify ledger
        $ledgerTx = LedgerTransaction::query()
            ->where('idempotency_key', 'deposit:settlement:' . $deposit->trx)
            ->first();
        $this->assertNotNull($ledgerTx);

        $entries = LedgerEntry::query()->where('ledger_transaction_id', $ledgerTx->id)->get();
        $this->assertCount(2, $entries);
        $this->assertSame('250.00000000', $entries->firstWhere('entry_side', 'debit')->amount);

        // Verify user balance
        $user->refresh();
        $this->assertEquals(250.0, $user->balance);
    }

    public function test_airwallex_invalid_timestamp_signature_returns_401(): void
    {
        Cache::flush();
        Gateway::query()->where('alias', 'Airwallex')->delete();

        Gateway::query()->create([
            'name' => 'Airwallex',
            'alias' => 'Airwallex',
            'code' => 5550 + rand(1, 999),
            'status' => 1,
            'gateway_parameters' => json_encode([
                'webhook_secret' => ['title' => 'Webhook Secret', 'global' => true, 'value' => $this->webhookSecret],
                'webhook_signature_header' => ['title' => 'Signature Header', 'global' => true, 'value' => 'x-signature'],
            ]),
        ]);

        $payload = [
            'id' => 'evt_fake_' . uniqid(),
            'name' => 'payment_intent.succeeded',
            'data' => ['object' => ['status' => 'SUCCEEDED', 'merchant_order_id' => 'TRXFAKE']],
        ];
        $body = json_encode($payload);
        // Sign with correct body but WRONG timestamp
        $correctTimestamp = (string) now()->timestamp;
        $signature = hash_hmac('sha256', $correctTimestamp . $body, $this->webhookSecret);

        // Send with DIFFERENT timestamp → signature mismatch
        $response = $this->postJson('/webhooks/airwallex', $payload, [
            'x-signature' => $signature,
            'x-timestamp' => (string) (now()->timestamp + 9999),
        ]);

        $response->assertUnauthorized();
    }
}
