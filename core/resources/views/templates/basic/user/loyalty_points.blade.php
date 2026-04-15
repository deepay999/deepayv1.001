@extends($activeTemplate . 'layouts.master')
@section('content')
    <div class="row justify-content-center">
        <div class="col-md-12">
            <div class="row mb-4">
                <div class="col-sm-6">
                    <div class="card custom--card">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="las la-star fs-3 text--base"></i>
                            </div>
                            <h4 class="text--base">{{ number_format(auth()->user()->points ?? 0) }}</h4>
                            <p class="text-muted mb-0">@lang('Points Balance')</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="card custom--card">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="las la-coins fs-3 text--base"></i>
                            </div>
                            <h4 class="text--base">
                                {{ gs('cur_sym') }}{{ showAmount((auth()->user()->points ?? 0) * (gs('points_value') ?? 0.01), currencyFormat: false) }}
                            </h4>
                            <p class="text-muted mb-0">@lang('Equivalent Value in :cur', ['cur' => gs('cur_text')])</p>
                        </div>
                    </div>
                </div>
            </div>

            @if (gs('min_redeem_points') && (auth()->user()->points ?? 0) < gs('min_redeem_points'))
                <div class="alert alert--warning mb-3">
                    <i class="las la-info-circle me-1"></i>
                    @lang('You need at least :pts points to redeem. You have :current pts.', [
                        'pts'     => number_format(gs('min_redeem_points')),
                        'current' => number_format(auth()->user()->points ?? 0),
                    ])
                </div>
            @endif

            <div class="card custom--card">
                <div class="card-body p-0">
                    <table class="table table--responsive--xl">
                        <thead>
                            <tr>
                                <th>@lang('Points')</th>
                                <th>@lang('Type')</th>
                                <th>@lang('Description')</th>
                                <th>@lang('Date')</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($points as $point)
                                <tr>
                                    <td data-label="@lang('Points')">
                                        @if ($point->points > 0)
                                            <span class="badge badge--success">+{{ number_format($point->points) }}</span>
                                        @else
                                            <span class="badge badge--danger">{{ number_format($point->points) }}</span>
                                        @endif
                                    </td>
                                    <td data-label="@lang('Type')">
                                        @php
                                            $typeLabels = [
                                                'earn'         => ['label' => 'Earn', 'class' => 'badge--success'],
                                                'redeem'       => ['label' => 'Redeem', 'class' => 'badge--primary'],
                                                'admin_add'    => ['label' => 'Bonus', 'class' => 'badge--info'],
                                                'admin_deduct' => ['label' => 'Deducted', 'class' => 'badge--warning'],
                                                'expire'       => ['label' => 'Expired', 'class' => 'badge--danger'],
                                            ];
                                            $typeInfo = $typeLabels[$point->type] ?? ['label' => ucfirst($point->type), 'class' => 'badge--secondary'];
                                        @endphp
                                        <span class="badge {{ $typeInfo['class'] }}">{{ __($typeInfo['label']) }}</span>
                                    </td>
                                    <td data-label="@lang('Description')">{{ $point->description }}</td>
                                    <td data-label="@lang('Date')">{{ showDateTime($point->created_at) }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">@lang('No points transactions found')</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            {{ $points->links() }}
        </div>
    </div>
@endsection
