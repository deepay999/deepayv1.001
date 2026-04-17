<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Start Merchant Area
|--------------------------------------------------------------------------
*/

Route::namespace('Merchant\Auth')->middleware('merchant.guest')->group(function () {
    Route::controller('LoginController')->group(function () {
        Route::get('/login', 'showLoginForm')->name('login');
        Route::post('/login', 'login');
        Route::post('qr-code/login/{id}', 'qrCodeLogin')->name('qrcode.login');
        Route::get('logout', 'logout')->middleware('merchant')->withoutMiddleware('merchant.guest')->name('logout');
    });

    Route::controller('RegisterController')->group(function () {
        Route::get('register', 'showRegistrationForm')->name('register');
        Route::post('register', 'register');
        Route::post('check-user', 'checkUser')->withoutMiddleware('guest');
    });

    Route::controller('ForgotPasswordController')->prefix('pin')->name('password.')->group(function () {
        Route::get('reset', 'showLinkRequestForm')->name('request');
        Route::post('email', 'sendResetCodeEmail');
        Route::get('code-verify', 'codeVerify')->name('code.verify');
        Route::post('verify-code', 'verifyCode');
    });

    Route::controller('ResetPasswordController')->group(function () {
        Route::post('password/reset', 'reset');
        Route::get('password/reset/{token}', 'showResetForm')->name('password.reset');
    });

    Route::controller('SocialiteController')->group(function () {
        Route::get('social-login/{provider}', 'socialLogin')->name('social.login');
        Route::get('social-login/callback/{provider}', 'callback')->name('social.login.callback');
    });
});


Route::namespace('Merchant')->middleware('merchant')->group(function () {
    //authorization
    Route::get('merchant-data', 'MerchantController@userData')->name('data')->middleware('mobile_verified:merchant');
    Route::post('merchant-data-submit', 'MerchantController@userDataSubmit')->middleware('mobile_verified:merchant');

    Route::controller('AuthorizationController')->group(function () {
        Route::get('authorization', 'authorizeForm')->name('authorization');
        Route::get('resend-verify/{type}', 'sendVerifyCode')->name('send.verify.code');
        Route::post('verify-email', 'emailVerification');
        Route::post('verify-mobile', 'mobileVerification');
        Route::post('verify-g2fa', 'g2faVerification');
    });


    Route::middleware(['mobile.verify:merchant', 'registration.complete:merchant', 'check.status:merchant'])->group(function () {
        Route::middleware('merchant')->group(function () {
            Route::controller('MerchantController')->group(function () {
                Route::get('dashboard', 'home')->name('home');
                Route::get('download-attachments/{file_hash}', 'downloadAttachment')->name('download.attachment');

                // Payment List
                Route::middleware('kyc.merchant')->group(function () {
                    Route::get('payment-list', 'paymentList')->name('payment.list');
                    Route::get('payment-details/{id}', 'paymentDetails')->name('payment.details');
                    Route::get('payment-pdf/{id}', 'paymentPdf')->name('payment.pdf');

                    //Report
                    Route::get('transactions', 'transactions')->name('transactions');
                    Route::get('statements', 'statements')->name('statement.history');
                });

                //2FA
                Route::get('twofactor', 'show2faForm')->name('twofactor');
                Route::post('twofactor/enable', 'create2fa');
                Route::post('twofactor/disable', 'disable2fa');

                //KYC
                Route::get('kyc-form', 'kycForm')->name('kyc.form');
                Route::get('kyc-data', 'kycData')->name('kyc.data');
                Route::post('kyc-submit', 'kycSubmit');
                Route::post('add-device-token', 'addDeviceToken');

                Route::get('notification/settings', 'notificationSetting')->name('notification.setting');
                Route::post('notification/settings', 'notificationSettingsUpdate');
            });

            // Withdraw
            Route::controller('WithdrawController')->prefix('withdraw')->middleware('kyc.merchant')->group(function () {
                Route::get('/', 'withdrawMoney')->name('withdraw');
                Route::post('/', 'withdrawStore')->name('withdraw.money');
                Route::get('preview', 'withdrawPreview')->name('withdraw.preview');
                Route::post('preview', 'withdrawSubmit')->name('withdraw.submit');
                Route::get('history', 'withdrawLog')->name('withdraw.history');

                // save account data
                Route::get('account/setting', 'accountSetting')->name('withdraw.account.setting');
                Route::get('account/save/{methodId}', 'saveAccount')->name('withdraw.account.save');
                Route::post('account/save-data/{methodId?}', 'saveAccountData')->name('withdraw.account.save.data');
                Route::get('account/edit/{id}', 'editAccount')->name('withdraw.account.edit');
                Route::post('account/delete/{id}', 'deleteAccount')->name('withdraw.account.delete');
            });

            //Profile setting
            Route::controller('ProfileController')->group(function () {
                Route::get('profile-setting', 'profile')->name('profile.setting');
                Route::post('profile-setting', 'submitProfile');
                Route::get('change-pin', 'changePassword')->name('change.password');
                Route::post('change-pin', 'submitPassword');
            });

        });
    });
});
