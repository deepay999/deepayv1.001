@extends('admin.layouts.app')
@section('panel')
    <x-admin.ui.card>
        <x-admin.ui.card.body>
            <div class="row gy-4">
                <div class="col-12">
                    <h4 class="mb-3">@lang('Airwallex Payment Gateway')</h4>
                    <p>@lang('Airwallex is available as an automatic gateway plugin for card payments and cross-border collections. Use this page to create the gateway record and configure it in the automatic gateway editor.')</p>
                </div>
                <div class="col-12">
                    <div class="alert alert-warning">
                        @lang('If Airwallex is not listed in the automatic gateway cards yet, click the button below to create the Airwallex gateway configuration record. After creating it, enter your Client ID, API Key, and choose the environment (demo or production), then enable the gateway.')
                    </div>
                </div>
                <div class="col-12">
                    <form action="{{ route('admin.gateway.automatic.airwallex.setup') }}" method="POST">
                        @csrf
                        <button type="submit" class="btn btn--primary">
                            <i class="las la-plus"></i> @lang('Create Airwallex Gateway Record')
                        </button>
                    </form>
                </div>
            </div>
        </x-admin.ui.card.body>
    </x-admin.ui.card>
@endsection

@push('breadcrumb-plugins')
    <x-back_btn route="{{ route('admin.gateway.automatic.index') }}" />
@endpush
