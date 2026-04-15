@extends('admin.layouts.app')
@section('content')
    <div class="row justify-content-center gy-4">

        @if (!auth('admin')->user()->ts)
            {{-- ── Setup: scan QR code and enter the first OTP ─────────────────── --}}
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">@lang('Add Your Account')</h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted mb-3">
                            @lang('Scan the QR code below with Google Authenticator, then enter the 6-digit code to activate 2FA.')
                        </p>
                        <div class="text-center mb-3">
                            <img src="{{ $qrCodeUrl }}" alt="2FA QR Code" class="img-fluid" style="max-width:200px">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">@lang('Manual Setup Key')</label>
                            <div class="input-group">
                                <input type="text" class="form-control referralURL" value="{{ $secret }}" id="secretKey" readonly>
                                <button type="button" class="btn btn-outline-secondary copytext" id="copyBoard">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <p class="small text-muted">
                            @lang('Download Google Authenticator:')
                            <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank">Android</a> /
                            <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank">iOS</a>
                        </p>
                    </div>
                </div>
            </div>
        @endif

        <div class="col-lg-6">
            @if (auth('admin')->user()->ts)
                {{-- ── Disable 2FA ────────────────────────────────────────────────── --}}
                <div class="card border-danger">
                    <div class="card-header">
                        <h5 class="card-title mb-0 text-danger">@lang('Disable 2FA Security')</h5>
                    </div>
                    <form action="{{ route('admin.twofactor.disable') }}" method="POST">
                        @csrf
                        <div class="card-body">
                            <p class="text-muted">@lang('Enter your current Google Authenticator code to deactivate 2FA.')</p>
                            <div class="mb-3">
                                <label class="form-label">@lang('Google Authenticator OTP')</label>
                                <input type="text" class="form-control" name="code" required autocomplete="one-time-code" inputmode="numeric" maxlength="6">
                            </div>
                        </div>
                        <div class="card-footer">
                            <button type="submit" class="btn btn-danger w-100">@lang('Disable 2FA')</button>
                        </div>
                    </form>
                </div>
            @else
                {{-- ── Enable 2FA ─────────────────────────────────────────────────── --}}
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">@lang('Enable 2FA Security')</h5>
                    </div>
                    <form action="{{ route('admin.twofactor.enable') }}" method="POST">
                        @csrf
                        <div class="card-body">
                            <p class="text-muted">@lang('After scanning the QR code, enter the 6-digit code from Google Authenticator to confirm.')</p>
                            <input type="hidden" name="key" value="{{ $secret }}">
                            <div class="mb-3">
                                <label class="form-label">@lang('Google Authenticator OTP')</label>
                                <input type="text" class="form-control" name="code" required autocomplete="one-time-code" inputmode="numeric" maxlength="6" placeholder="000000">
                            </div>
                        </div>
                        <div class="card-footer">
                            <button type="submit" class="btn btn-primary w-100">@lang('Enable 2FA')</button>
                        </div>
                    </form>
                </div>
            @endif
        </div>

    </div>
@endsection

@push('script')
    <script>
        (function ($) {
            "use strict";
            $('#copyBoard').on('click', function () {
                var el = document.getElementById('secretKey');
                el.select();
                el.setSelectionRange(0, 99999);
                document.execCommand("copy");
                el.blur();
                $(this).html('<i class="fas fa-check"></i>');
                setTimeout(() => $(this).html('<i class="fas fa-copy"></i>'), 1500);
            });
        })(jQuery);
    </script>
@endpush
