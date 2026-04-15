@extends('admin.layouts.app')
@section('panel')
    {{-- Summary Stats --}}
    <div class="row responsive-row mb-4">
        <div class="col-xxl-2 col-sm-4">
            <x-admin.ui.widget.four variant="primary" title="Total Users" :value="number_format($stats['total_users'])" icon="las la-users" />
        </div>
        <div class="col-xxl-2 col-sm-4">
            <x-admin.ui.widget.four variant="success" title="Total Available Balance"
                :value="gs('cur_sym') . showAmount($stats['total_balance'], currencyFormat: false)" icon="las la-wallet" />
        </div>
        <div class="col-xxl-2 col-sm-4">
            <x-admin.ui.widget.four variant="danger" title="Total Frozen Balance"
                :value="gs('cur_sym') . showAmount($stats['total_frozen'], currencyFormat: false)" icon="las la-lock" />
        </div>
        <div class="col-xxl-2 col-sm-4">
            <x-admin.ui.widget.four variant="info" title="Total Points Issued"
                :value="number_format($stats['total_points']) . ' pts'" icon="las la-star" />
        </div>
        <div class="col-xxl-2 col-sm-4">
            <x-admin.ui.widget.four variant="success" title="Today Deposits"
                :value="gs('cur_sym') . showAmount($stats['today_deposits'], currencyFormat: false)" icon="las la-arrow-alt-circle-down" />
        </div>
        <div class="col-xxl-2 col-sm-4">
            <x-admin.ui.widget.four variant="warning" title="Today Withdrawals"
                :value="gs('cur_sym') . showAmount($stats['today_withdrawals'], currencyFormat: false)" icon="las la-arrow-alt-circle-up" />
        </div>
    </div>

    <div class="row">
        {{-- Module Settings --}}
        <div class="col-lg-6">
            <x-admin.ui.card>
                <x-admin.ui.card.header>
                    <h4 class="card-title">@lang('Wallet Feature Modules')</h4>
                    <a href="{{ route('admin.module.setting') }}" class="btn btn--primary btn-sm">
                        <i class="las la-cog me-1"></i>@lang('Manage')
                    </a>
                </x-admin.ui.card.header>
                <x-admin.ui.card.body>
                    <div class="table-responsive">
                        <table class="table table--light style--two">
                            <thead>
                                <tr>
                                    <th>@lang('Module')</th>
                                    <th>@lang('Status')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($modules as $module)
                                    <tr>
                                        <td>
                                            <i class="{{ $module->icon }} me-1"></i>{{ __($module->title) }}
                                        </td>
                                        <td>
                                            @if ($module->status)
                                                <span class="badge badge--success">@lang('Enabled')</span>
                                            @else
                                                <span class="badge badge--danger">@lang('Disabled')</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </x-admin.ui.card.body>
            </x-admin.ui.card>
        </div>

        {{-- Transaction Charges --}}
        <div class="col-lg-6">
            <x-admin.ui.card>
                <x-admin.ui.card.header>
                    <h4 class="card-title">@lang('Transaction Charge Configuration')</h4>
                </x-admin.ui.card.header>
                <x-admin.ui.card.body>
                    <div class="table-responsive">
                        <table class="table table--light style--two">
                            <thead>
                                <tr>
                                    <th>@lang('Type')</th>
                                    <th>@lang('Fixed')</th>
                                    <th>@lang('Percent')</th>
                                    <th>@lang('Min / Max')</th>
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ([
                                    ['label' => 'Send Money', 'charge' => $sendMoneyCharge, 'route' => 'admin.send.money.charge.setting'],
                                    ['label' => 'Cash Out', 'charge' => $cashOutCharge, 'route' => 'admin.cashout.charge.setting'],
                                    ['label' => 'Cash In', 'charge' => $cashInCharge, 'route' => 'admin.cashin.charge.setting'],
                                    ['label' => 'Payment', 'charge' => $paymentCharge, 'route' => 'admin.payment.charge.setting'],
                                    ['label' => 'Bank Transfer', 'charge' => $bankXferCharge, 'route' => 'admin.bank.transfer.charge.setting'],
                                ] as $item)
                                    <tr>
                                        <td>{{ __($item['label']) }}</td>
                                        @if ($item['charge'])
                                            <td>{{ showAmount($item['charge']->fixed_charge, currencyFormat: false) }} {{ gs('cur_text') }}</td>
                                            <td>{{ $item['charge']->percent_charge }}%</td>
                                            <td>{{ showAmount($item['charge']->min_limit, currencyFormat: false) }} / {{ showAmount($item['charge']->max_limit, currencyFormat: false) }}</td>
                                        @else
                                            <td colspan="3" class="text-muted">@lang('Not configured')</td>
                                        @endif
                                        <td>
                                            <a href="{{ route($item['route']) }}" class="btn btn--sm btn--primary">
                                                <i class="las la-edit"></i>
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </x-admin.ui.card.body>
            </x-admin.ui.card>
        </div>

        {{-- Loyalty Settings Summary --}}
        <div class="col-lg-6 mt-4">
            <x-admin.ui.card>
                <x-admin.ui.card.header>
                    <h4 class="card-title">@lang('Loyalty Points Settings')</h4>
                    <a href="{{ route('admin.loyalty.settings') }}" class="btn btn--primary btn-sm">
                        <i class="las la-cog me-1"></i>@lang('Configure')
                    </a>
                </x-admin.ui.card.header>
                <x-admin.ui.card.body>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between">
                            <span>@lang('Status')</span>
                            @if (gs('loyalty_points'))
                                <span class="badge badge--success">@lang('Enabled')</span>
                            @else
                                <span class="badge badge--danger">@lang('Disabled')</span>
                            @endif
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>@lang('Points per :cur', ['cur' => gs('cur_text')])</span>
                            <strong>{{ gs('points_per_currency') ?? 1 }} @lang('pts')</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>@lang('Point Value')</span>
                            <strong>{{ gs('cur_sym') }}{{ gs('points_value') ?? 0.01 }}</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>@lang('Minimum Redeem')</span>
                            <strong>{{ number_format(gs('min_redeem_points') ?? 100) }} @lang('pts')</strong>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>@lang('Total Points Issued')</span>
                            <strong>{{ number_format($stats['total_points']) }} @lang('pts')</strong>
                        </li>
                    </ul>
                </x-admin.ui.card.body>
            </x-admin.ui.card>
        </div>

        {{-- Quick Links --}}
        <div class="col-lg-6 mt-4">
            <x-admin.ui.card>
                <x-admin.ui.card.header>
                    <h4 class="card-title">@lang('Quick Links')</h4>
                </x-admin.ui.card.header>
                <x-admin.ui.card.body>
                    <div class="d-flex flex-wrap gap-2">
                        <a href="{{ route('admin.deposit.list') }}" class="btn btn--primary">
                            <i class="las la-arrow-alt-circle-down me-1"></i>@lang('All Deposits')
                        </a>
                        <a href="{{ route('admin.withdraw.data.all') }}" class="btn btn--warning">
                            <i class="las la-arrow-alt-circle-up me-1"></i>@lang('All Withdrawals')
                        </a>
                        <a href="{{ route('admin.send.money.history') }}" class="btn btn--success">
                            <i class="las la-paper-plane me-1"></i>@lang('Send Money History')
                        </a>
                        <a href="{{ route('admin.report.transaction') }}" class="btn btn--info">
                            <i class="las la-list me-1"></i>@lang('All Transactions')
                        </a>
                        <a href="{{ route('admin.loyalty.history') }}" class="btn btn--secondary">
                            <i class="las la-star me-1"></i>@lang('Points History')
                        </a>
                        <a href="{{ route('admin.users.with.balance') }}" class="btn btn--primary">
                            <i class="las la-users me-1"></i>@lang('Users with Balance')
                        </a>
                    </div>
                </x-admin.ui.card.body>
            </x-admin.ui.card>
        </div>
    </div>
@endsection
