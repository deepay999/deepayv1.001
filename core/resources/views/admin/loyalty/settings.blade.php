@extends('admin.layouts.app')
@section('panel')
    <form method="POST" action="{{ route('admin.loyalty.settings.update') }}">
        @csrf
        <x-admin.ui.card>
            <x-admin.ui.card.header>
                <div>
                    <h4 class="card-title">@lang('Loyalty Points Settings')</h4>
                    <p class="text-muted">@lang('Configure how users earn and redeem loyalty points')</p>
                </div>
            </x-admin.ui.card.header>
            <x-admin.ui.card.body>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group">
                            <label class="form-label">@lang('Loyalty Points System')</label>
                            <div class="form-check form-switch form--switch">
                                <input class="form-check-input" type="checkbox" name="loyalty_points" id="loyaltyPoints"
                                    @checked(gs('loyalty_points'))>
                                <label class="form-check-label" for="loyaltyPoints">
                                    @lang('Enable Loyalty Points System')
                                </label>
                            </div>
                            <small class="text-muted">@lang('When enabled, users earn points on transactions which can be redeemed for wallet balance.')</small>
                        </div>
                    </div>

                    <div class="col-sm-4">
                        <div class="form-group">
                            <label class="form-label required">@lang('Points per Currency Unit')</label>
                            <div class="input-group input--group">
                                <input type="number" step="any" min="0.0001" class="form-control" name="points_per_currency"
                                    value="{{ gs('points_per_currency') ?? 1 }}" required>
                                <span class="input-group-text">@lang('pts / :cur', ['cur' => gs('cur_text')])</span>
                            </div>
                            <small class="text-muted">@lang('Number of points earned per 1 :cur spent.', ['cur' => gs('cur_text')])</small>
                        </div>
                    </div>

                    <div class="col-sm-4">
                        <div class="form-group">
                            <label class="form-label required">@lang('Points Value')</label>
                            <div class="input-group input--group">
                                <input type="number" step="any" min="0.000001" class="form-control" name="points_value"
                                    value="{{ gs('points_value') ?? 0.01 }}" required>
                                <span class="input-group-text">{{ gs('cur_text') }} @lang('per pt')</span>
                            </div>
                            <small class="text-muted">@lang('Monetary value of each point when redeemed.')</small>
                        </div>
                    </div>

                    <div class="col-sm-4">
                        <div class="form-group">
                            <label class="form-label required">@lang('Minimum Redeem Points')</label>
                            <div class="input-group input--group">
                                <input type="number" step="1" min="1" class="form-control" name="min_redeem_points"
                                    value="{{ gs('min_redeem_points') ?? 100 }}" required>
                                <span class="input-group-text">@lang('pts')</span>
                            </div>
                            <small class="text-muted">@lang('Minimum points required before a user can redeem.')</small>
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="alert alert--primary">
                            <i class="las la-info-circle me-1"></i>
                            @lang('Example: With :ppc pts/currency and :pv :cur/pt value, spending :cur 10 earns :pts pts worth :val :cur.', [
                                'ppc' => gs('points_per_currency') ?? 1,
                                'pv'  => gs('points_value') ?? 0.01,
                                'cur' => gs('cur_text'),
                                'pts' => (gs('points_per_currency') ?? 1) * 10,
                                'val' => showAmount(((gs('points_per_currency') ?? 1) * 10) * (gs('points_value') ?? 0.01), currencyFormat: false),
                            ])
                        </div>
                    </div>
                </div>
            </x-admin.ui.card.body>
            <x-admin.ui.card.footer>
                <x-admin.ui.btn.submit />
            </x-admin.ui.card.footer>
        </x-admin.ui.card>
    </form>

    <x-admin.ui.card class="mt-4">
        <x-admin.ui.card.header>
            <h4 class="card-title">@lang('Quick Links')</h4>
        </x-admin.ui.card.header>
        <x-admin.ui.card.body>
            <div class="d-flex gap-3 flex-wrap">
                <a href="{{ route('admin.loyalty.history') }}" class="btn btn--primary">
                    <i class="las la-history me-1"></i>@lang('View All Points History')
                </a>
            </div>
        </x-admin.ui.card.body>
    </x-admin.ui.card>
@endsection
