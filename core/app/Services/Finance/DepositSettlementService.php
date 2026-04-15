<?php

namespace App\Services\Finance;

use App\Constants\Status;
use App\Models\AdminNotification;
use App\Models\Agent;
use App\Models\Deposit;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WalletBalance;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DepositSettlementService
{
    public function __construct(private WalletService $walletService)
    {
    }

    public function settle(Deposit $deposit, bool $isManual = false, array $context = []): void
    {
        DB::transaction(function () use ($deposit, $isManual, $context) {
            $deposit = Deposit::query()->whereKey($deposit->id)->lockForUpdate()->with('gateway')->firstOrFail();

            if (!in_array((int) $deposit->status, [Status::PAYMENT_INITIATE, Status::PAYMENT_PENDING], true)) {
                return;
            }

            [$accountType, $ownerId, $owner] = $this->resolveOwner($deposit);

            $currency = strtoupper((string) gs('cur_text'));
            $amount = number_format((float) $deposit->amount, 8, '.', '');
            $gatewayAlias = $deposit->gateway->alias ?? 'Unknown';

            $this->walletService->settleIncomingDeposit(
                $accountType,
                $ownerId,
                $currency,
                $amount,
                'deposit:settlement:' . $deposit->trx,
                [
                    'reference_type' => Deposit::class,
                    'reference_id' => $deposit->id,
                    'reference_code' => $deposit->trx,
                    'external_reference' => $context['external_reference'] ?? $deposit->trx,
                    'event_type' => $context['event_type'] ?? 'deposit.posted',
                    'settlement_event_type' => $context['settlement_event_type'] ?? 'deposit.settlement.clearing',
                    'metadata' => array_merge([
                        'deposit_trx' => $deposit->trx,
                        'gateway_alias' => $gatewayAlias,
                        'gateway_currency' => $deposit->method_currency,
                    ], $context['metadata'] ?? []),
                    'payload' => [
                        'deposit_id' => $deposit->id,
                        'deposit_trx' => $deposit->trx,
                        'account_type' => $accountType,
                        'owner_id' => $ownerId,
                        'amount' => $amount,
                        'currency' => $currency,
                        'gateway_alias' => $gatewayAlias,
                    ],
                ]
            );

            $projection = WalletBalance::query()
                ->where('account_type', $accountType)
                ->where('owner_id', $ownerId)
                ->where('currency', $currency)
                ->lockForUpdate()
                ->first();

            if (!$projection) {
                throw new RuntimeException('Wallet projection missing after deposit settlement');
            }

            $owner->balance = (float) $projection->available_balance;
            $owner->save();

            $deposit->status = Status::PAYMENT_SUCCESS;
            $deposit->save();

            $attributes = [
                'trx' => $deposit->trx,
                'remark' => 'add_money',
            ];

            if ($accountType === 'user') {
                $attributes['user_id'] = $owner->id;
            } else {
                $attributes['agent_id'] = $owner->id;
            }

            Transaction::query()->updateOrCreate($attributes, [
                'amount' => $deposit->amount,
                'post_balance' => $owner->balance,
                'charge' => $deposit->charge,
                'trx_type' => '+',
                'details' => 'Add money via ' . $deposit->methodName(),
            ]);

            if (!$isManual) {
                $notification = new AdminNotification();
                if ($accountType === 'user') {
                    $notification->user_id = $owner->id;
                } else {
                    $notification->agent_id = $owner->id;
                }
                $notification->title = 'Add Money successful via ' . $deposit->methodName();
                $notification->click_url = urlPath('admin.deposit.successful');
                $notification->save();
            }

            notify($owner, $isManual ? 'DEPOSIT_APPROVE' : 'DEPOSIT_COMPLETE', [
                'method_name' => $deposit->methodName(),
                'method_currency' => $deposit->method_currency,
                'method_amount' => showAmount($deposit->final_amount, currencyFormat: false),
                'amount' => showAmount($deposit->amount, currencyFormat: false),
                'charge' => showAmount($deposit->charge, currencyFormat: false),
                'rate' => showAmount($deposit->rate, currencyFormat: false),
                'trx' => $deposit->trx,
                'post_balance' => showAmount($owner->balance),
            ]);
        });
    }

    private function resolveOwner(Deposit $deposit): array
    {
        if ($deposit->user_id) {
            return ['user', (int) $deposit->user_id, User::query()->lockForUpdate()->findOrFail($deposit->user_id)];
        }

        if ($deposit->agent_id) {
            return ['agent', (int) $deposit->agent_id, Agent::query()->lockForUpdate()->findOrFail($deposit->agent_id)];
        }

        throw new RuntimeException('Deposit settlement currently supports user or agent deposits only');
    }
}