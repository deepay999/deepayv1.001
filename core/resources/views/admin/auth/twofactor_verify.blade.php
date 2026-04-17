@extends('admin.layouts.master')
@section('content')
    <main class="account">
        <span class="account__overlay bg-img dark-bg"
            data-background-image="{{ asset('assets/admin/images/login-dark.png') }}"></span>
        <span class="account__overlay bg-img light-bg"
            data-background-image="{{ asset('assets/admin/images/login-bg.png') }}"></span>
        <div class="account__card">
            <div class="account__logo">
                <img src="{{ siteLogo() }}" class="light-show" alt="brand-thumb">
                <img src="{{ siteLogo('dark') }}" class="dark-show" alt="brand-thumb">
            </div>
            <h2 class="account__title">@lang('2FA Verification') 🔐</h2>
            <p class="account__desc">@lang('Enter the 6-digit code from your Google Authenticator app to continue.')</p>

            <form action="{{ route('admin.2fa.verify.post') }}" method="POST" class="account__form">
                @csrf
                <div class="form-group">
                    <label class="form--label">@lang('Authenticator Code')</label>
                    <input type="text"
                           class="form--control h-48"
                           name="code"
                           required
                           autocomplete="one-time-code"
                           inputmode="numeric"
                           maxlength="6"
                           placeholder="000000"
                           autofocus>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn--primary w-100 h-48 mb-2 fs-16">
                        <i class="fa-solid fa-shield-halved"></i> @lang('Verify')
                    </button>
                </div>
            </form>

            <p class="text-center small mt-2">
                <a href="{{ route('admin.logout') }}">@lang('Log out')</a>
            </p>
        </div>
    </main>
@endsection
