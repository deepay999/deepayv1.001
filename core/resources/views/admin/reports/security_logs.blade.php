@extends('admin.layouts.app')

@section('panel')
<div class="row">
    {{-- Stats Cards --}}
    <div class="col-12 mb-4">
        <div class="row g-3">
            @php
                $badgeMap = ['total'=>'danger','xss'=>'warning','sql'=>'danger','scan'=>'info','php'=>'dark'];
                $labelMap = ['total'=>'Total Threats','xss'=>'XSS','sql'=>'SQL Inject','scan'=>'Scanner/Probe','php'=>'PHP Inject'];
            @endphp
            @foreach(['total','xss','sql','scan','php'] as $k)
            <div class="col-6 col-md-2">
                <div class="card text-center border-0 shadow-sm">
                    <div class="card-body py-3">
                        <h3 class="mb-0 text--{{ $badgeMap[$k] }}">{{ number_format($stats[$k]) }}</h3>
                        <small class="text-muted">{{ $labelMap[$k] }}</small>
                    </div>
                </div>
            </div>
            @endforeach
            <div class="col-6 col-md-2">
                <div class="card text-center border-0 shadow-sm">
                    <div class="card-body py-3">
                        <h3 class="mb-0 text--success">{{ count($logPaths) }}</h3>
                        <small class="text-muted">Log Files</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Filter Bar --}}
    <div class="col-12 mb-3">
        <x-admin.ui.card>
            <x-admin.ui.card.body>
                <form method="GET" class="row g-2 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">@lang('Attack Type')</label>
                        <select name="type" class="form-select">
                            @foreach(['all'=>'All Types','xss'=>'XSS','sql'=>'SQL Injection','scan'=>'Scanner / Probe','php'=>'PHP Injection'] as $v=>$l)
                                <option value="{{ $v }}" @selected($filterType===$v)>{{ $l }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-semibold">@lang('Max Results')</label>
                        <select name="limit" class="form-select">
                            @foreach([100,250,500,1000,5000] as $n)
                                <option value="{{ $n }}" @selected($filterLimit===$n)>{{ $n }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button type="submit" class="btn btn--primary w-100">
                            <i class="las la-search"></i> @lang('Scan')
                        </button>
                    </div>
                </form>
            </x-admin.ui.card.body>
        </x-admin.ui.card>
    </div>

    {{-- Errors --}}
    @if(count($errors))
    <div class="col-12 mb-3">
        <div class="alert alert-warning">
            <strong>@lang('Log Access Warnings:')</strong>
            <ul class="mb-0">@foreach($errors as $e)<li>{{ $e }}</li>@endforeach</ul>
        </div>
    </div>
    @endif

    {{-- Log Files Found --}}
    <div class="col-12 mb-3">
        <x-admin.ui.card>
            <x-admin.ui.card.body>
                <h6 class="mb-2"><i class="las la-file-alt text--info"></i> @lang('Scanned Log Files')</h6>
                @forelse($logPaths as $lp)
                    <span class="badge bg--dark me-1 mb-1">{{ $lp }}</span>
                @empty
                    <span class="text-muted">@lang('No accessible log files found.')</span>
                @endforelse
            </x-admin.ui.card.body>
        </x-admin.ui.card>
    </div>

    {{-- Results Table --}}
    <div class="col-12">
        <x-admin.ui.card>
            <x-admin.ui.card.body :paddingZero="true">
                <x-admin.ui.table>
                    <x-admin.ui.table.header>
                        <tr>
                            <th>#</th>
                            <th>@lang('Type')</th>
                            <th>@lang('IP')</th>
                            <th>@lang('Time')</th>
                            <th>@lang('File : Line')</th>
                            <th>@lang('Pattern')</th>
                            <th>@lang('Log Entry')</th>
                        </tr>
                    </x-admin.ui.table.header>
                    <x-admin.ui.table.body>
                        @forelse($results as $i => $r)
                        @php
                            $typeColor = ['xss'=>'warning','sql'=>'danger','scan'=>'info','php'=>'dark'][$r['type']] ?? 'secondary';
                        @endphp
                        <tr>
                            <td>{{ $i + 1 }}</td>
                            <td><span class="badge bg--{{ $typeColor }}">{{ strtoupper($r['type']) }}</span></td>
                            <td><code>{{ $r['ip'] }}</code></td>
                            <td><small>{{ $r['time'] }}</small></td>
                            <td><small class="text-muted">{{ $r['file'] }}:{{ $r['line'] }}</small></td>
                            <td><code class="text--danger">{{ $r['pattern'] }}</code></td>
                            <td>
                                <div class="text-truncate" style="max-width:400px;" title="{{ e($r['content']) }}">
                                    <small>{{ $r['content'] }}</small>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <x-admin.ui.table.empty_message />
                        @endforelse
                    </x-admin.ui.table.body>
                </x-admin.ui.table>
            </x-admin.ui.card.body>
        </x-admin.ui.card>
    </div>
</div>
@endsection
