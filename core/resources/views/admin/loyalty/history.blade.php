@extends('admin.layouts.app')
@section('panel')
    <x-admin.ui.card>
        <x-admin.ui.card.header>
            <h4 class="card-title">@lang('All Loyalty Points Transactions')</h4>
        </x-admin.ui.card.header>
        <x-admin.ui.card.body>
            <form method="GET" class="row g-2 mb-3">
                <div class="col-sm-4">
                    <input type="text" name="search" class="form-control" placeholder="@lang('Search by username or email')"
                        value="{{ request('search') }}">
                </div>
                <div class="col-sm-3">
                    <select name="type" class="form-control select2">
                        <option value="">@lang('All Types')</option>
                        <option value="earn" @selected(request('type') == 'earn')>@lang('Earn')</option>
                        <option value="redeem" @selected(request('type') == 'redeem')>@lang('Redeem')</option>
                        <option value="admin_add" @selected(request('type') == 'admin_add')>@lang('Admin Add')</option>
                        <option value="admin_deduct" @selected(request('type') == 'admin_deduct')>@lang('Admin Deduct')</option>
                        <option value="expire" @selected(request('type') == 'expire')>@lang('Expire')</option>
                    </select>
                </div>
                <div class="col-sm-2">
                    <button type="submit" class="btn btn--primary w-100">
                        <i class="las la-search me-1"></i>@lang('Filter')
                    </button>
                </div>
            </form>

            <div class="table-responsive">
                <table class="table table--light style--two">
                    <thead>
                        <tr>
                            <th>@lang('User')</th>
                            <th>@lang('Points')</th>
                            <th>@lang('Type')</th>
                            <th>@lang('Description')</th>
                            <th>@lang('Date')</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($points as $point)
                            <tr>
                                <td>
                                    @if ($point->user)
                                        <a href="{{ route('admin.users.detail', $point->user_id) }}"
                                            class="fw-bold">{{ $point->user->username }}</a>
                                    @else
                                        <span class="text-muted">@lang('Deleted User')</span>
                                    @endif
                                </td>
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
