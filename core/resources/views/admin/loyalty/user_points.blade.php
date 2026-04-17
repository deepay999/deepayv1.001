@extends('admin.layouts.app')
@section('panel')
    <div class="row mb-3">
        <div class="col-sm-6">
            <div class="widget-card widget--primary">
                <div class="widget-card-left">
                    <div class="widget-icon"><i class="las la-star"></i></div>
                    <div class="widget-card-content">
                        <p class="widget-title">@lang('Current Points Balance')</p>
                        <h6 class="widget-amount">{{ number_format($user->points) }} <span class="currency">@lang('pts')</span></h6>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="widget-card widget--success">
                <div class="widget-card-left">
                    <div class="widget-icon"><i class="las la-coins"></i></div>
                    <div class="widget-card-content">
                        <p class="widget-title">@lang('Equivalent Value')</p>
                        <h6 class="widget-amount">
                            {{ gs('cur_sym') }}{{ showAmount($user->points * (gs('points_value') ?? 0.01), currencyFormat: false) }}
                            <span class="currency">{{ gs('cur_text') }}</span>
                        </h6>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <x-admin.ui.card>
        <x-admin.ui.card.header>
            <h4 class="card-title">@lang('Points History for') {{ $user->username }}</h4>
        </x-admin.ui.card.header>
        <x-admin.ui.card.body>
            <div class="table-responsive">
                <table class="table table--light style--two">
                    <thead>
                        <tr>
                            <th>@lang('Points')</th>
                            <th>@lang('Type')</th>
                            <th>@lang('Description')</th>
                            <th>@lang('Reference')</th>
                            <th>@lang('Date')</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($points as $point)
                            <tr>
                                <td>
                                    @if ($point->points > 0)
                                        <span class="badge badge--success">+{{ number_format($point->points) }}</span>
                                    @else
                                        <span class="badge badge--danger">{{ number_format($point->points) }}</span>
                                    @endif
                                </td>
                                <td>
                                    @php
                                        $typeLabels = [
                                            'earn'         => ['label' => 'Earn', 'class' => 'badge--success'],
                                            'redeem'       => ['label' => 'Redeem', 'class' => 'badge--primary'],
                                            'admin_add'    => ['label' => 'Admin Add', 'class' => 'badge--info'],
                                            'admin_deduct' => ['label' => 'Admin Deduct', 'class' => 'badge--warning'],
                                            'expire'       => ['label' => 'Expire', 'class' => 'badge--danger'],
                                        ];
                                        $typeInfo = $typeLabels[$point->type] ?? ['label' => ucfirst($point->type), 'class' => 'badge--secondary'];
                                    @endphp
                                    <span class="badge {{ $typeInfo['class'] }}">{{ __($typeInfo['label']) }}</span>
                                </td>
                                <td>{{ $point->description }}</td>
                                <td>{{ $point->reference_id ?? '-' }}</td>
                                <td>{{ showDateTime($point->created_at) }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center">@lang('No points transactions found')</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            {{ $points->links() }}
        </x-admin.ui.card.body>
    </x-admin.ui.card>
@endsection

@push('breadcrumb-plugins')
    <div class="d-flex gap-2 flex-wrap">
        <button type="button" class="btn btn--success points-adjust" data-act="add">
            <i class="las la-plus me-1"></i>@lang('Add Points')
        </button>
        <button type="button" class="btn btn--danger points-adjust" data-act="sub">
            <i class="las la-minus-circle me-1"></i>@lang('Deduct Points')
        </button>
        @if (gs('loyalty_points') && $user->points >= (gs('min_redeem_points') ?? 100))
            <button type="button" class="btn btn--primary" data-bs-toggle="modal" data-bs-target="#redeemModal">
                <i class="las la-exchange-alt me-1"></i>@lang('Redeem to Balance')
            </button>
        @endif
        <a href="{{ route('admin.users.detail', $user->id) }}" class="btn btn--secondary">
            <i class="las la-arrow-left me-1"></i>@lang('Back to User')
        </a>
    </div>
@endpush

<x-admin.ui.modal id="addSubPointsModal">
    <x-admin.ui.modal.header>
        <div>
            <h4 class="modal-title">@lang('Add Points')</h4>
        </div>
        <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close">
            <i class="las la-times"></i>
        </button>
    </x-admin.ui.modal.header>
    <x-admin.ui.modal.body>
        <form method="POST" action="{{ route('admin.loyalty.add.sub.points', $user->id) }}">
            @csrf
            <input type="hidden" name="act">
            <div class="form-group">
                <label class="form-label">@lang('Points')</label>
                <input type="number" step="1" min="1" name="points" class="form-control"
                    placeholder="@lang('Enter points')" required>
            </div>
            <div class="form-group">
                <label class="form-label">@lang('Description')</label>
                <textarea class="form-control" placeholder="@lang('Enter description')" name="description" rows="3"
                    required></textarea>
            </div>
            <div class="form-group">
                <x-admin.ui.btn.modal />
            </div>
        </form>
    </x-admin.ui.modal.body>
</x-admin.ui.modal>

@if (gs('loyalty_points'))
    <x-admin.ui.modal id="redeemModal">
        <x-admin.ui.modal.header>
            <div>
                <h4 class="modal-title">@lang('Redeem Points to Balance')</h4>
                <small class="modal-subtitle">
                    @lang('Current points: :pts | Min redeem: :min', ['pts' => number_format($user->points), 'min' => number_format(gs('min_redeem_points'))])
                </small>
            </div>
            <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close">
                <i class="las la-times"></i>
            </button>
        </x-admin.ui.modal.header>
        <x-admin.ui.modal.body>
            <form method="POST" action="{{ route('admin.loyalty.redeem', $user->id) }}">
                @csrf
                <div class="form-group">
                    <label class="form-label">@lang('Points to Redeem')</label>
                    <div class="input-group input--group">
                        <input type="number" step="1" min="{{ gs('min_redeem_points') }}"
                            max="{{ $user->points }}" name="points" id="redeemPoints" class="form-control"
                            placeholder="@lang('Enter points')" required>
                        <span class="input-group-text">@lang('pts')</span>
                    </div>
                    <small class="text-muted">
                        @lang('Value: :sym<span id="redeemValue">0.00</span> :cur', ['sym' => gs('cur_sym'), 'cur' => gs('cur_text')])
                    </small>
                </div>
                <div class="form-group">
                    <x-admin.ui.btn.modal />
                </div>
            </form>
        </x-admin.ui.modal.body>
    </x-admin.ui.modal>
@endif

@push('script')
    <script>
        "use strict";
        (function($) {
            $(".points-adjust").on('click', function(e) {
                const modal = $('#addSubPointsModal');
                const act = $(this).data('act');
                if (act == 'add') {
                    modal.find(".modal-title").text("@lang('Add Points')");
                } else {
                    modal.find(".modal-title").text("@lang('Deduct Points')");
                }
                modal.find("[name=act]").val(act);
                modal.modal('show');
            });

            $('#redeemPoints').on('input', function() {
                const pts = parseInt($(this).val()) || 0;
                const value = (pts * {{ gs('points_value') ?? 0.01 }}).toFixed(2);
                $('#redeemValue').text(value);
            });
        })(jQuery);
    </script>
@endpush
