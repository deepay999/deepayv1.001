<?php

use Illuminate\Support\Facades\Route;

Route::namespace('User\Auth')->name('user.')->middleware('guest')->group(function () {
    Route::controller('LoginController')->group(function () {
        Route::get('/login', 'showLoginForm')->name('login');
        Route::post('/login', 'login');
        Route::post('qr-code/login/{id}', 'qrCodeLogin')->name('qrcode.login');
        Route::get('logout', 'logout')->middleware('auth')->withoutMiddleware('guest')->name('logout');
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
        Route::get('password/reset/{token}', 'showResetForm')->name('password.reset');
        Route::post('password/reset', 'reset');
    });

    Route::controller('SocialiteController')->group(function () {
        Route::get('social-login/{provider}', 'socialLogin')->name('social.login');
        Route::get('social-login/callback/{provider}', 'callback')->name('social.login.callback');
    });
});

Route::middleware('auth')->name('user.')->group(function () {

    //authorization
    Route::get('user-data', 'User\UserController@userData')->name('data')->middleware('mobile_verified');
    Route::post('user-data-submit', 'User\UserController@userDataSubmit')->middleware('mobile_verified');

    Route::namespace('User')->controller('AuthorizationController')->group(function () {
        Route::get('authorization', 'authorizeForm')->name('authorization');
        Route::get('resend-verify/{type}', 'sendVerifyCode')->name('send.verify.code');
        Route::post('verify-email', 'emailVerification');
        Route::post('verify-mobile', 'mobileVerification');
        Route::post('verify-g2fa', 'g2faVerification');
    });

    Route::middleware(['check.status', 'registration.complete', "mobile.verify"])->group(function () {

        Route::namespace('User')->group(function () {
            Route::controller('UserController')->group(function () {
                Route::get('dashboard', 'home')->name('home');
                Route::get('download-attachments/{file_hash}', 'downloadAttachment')->name('download.attachment');
                //2FA
                Route::get('twofactor', 'show2faForm')->name('twofactor');
                Route::post('twofactor/enable', 'create2fa');
                Route::post('twofactor/disable', 'disable2fa');
                //KYC
                Route::get('kyc-form', 'kycForm')->name('kyc.form');
                Route::get('kyc-data', 'kycData')->name('kyc.data');
                Route::post('kyc-submit', 'kycSubmit');
                //Report
                Route::any('deposit/history', 'depositHistory')->name('deposit.history');
                Route::get('transactions', 'transactions')->name('transactions');
                Route::get('loyalty-points', 'loyaltyPoints')->name('loyalty.points');

                Route::post('add-device-token', 'addDeviceToken');

                Route::get('notification/settings', 'notificationSetting')->name('notification.setting');
                Route::post('notification/settings', 'notificationSettingsUpdate');
            });

            //Profile setting
            Route::controller('ProfileController')->group(function () {
                Route::get('profile-setting', 'profile')->name('profile.setting');
                Route::post('profile-setting', 'submitProfile');
                Route::get('change-password', 'changePassword')->name('change.password');
                Route::post('change-password', 'submitPassword');
            });

            // Withdraw
            Route::middleware('kyc')->group(function () {
                Route::controller('WithdrawController')->prefix('withdraw')->name('withdraw.')->group(function () {
                    Route::get('/', 'withdrawMoney')->name('index');
                    Route::post('/', 'withdrawStore')->name('store');
                    Route::get('preview', 'withdrawPreview')->name('preview');
                    Route::post('preview', 'withdrawSubmit')->name('submit');
                    Route::get('history', 'withdrawLog')->name('history');
                });

                // Send Money
                Route::prefix('send-money')->middleware(['module:send_money'])->name('send.money.')->controller('SendMoneyController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                });

                // Make Payment
                Route::prefix('make-payment')->middleware(['module:make_payment'])->name('make.payment.')->controller('MakePaymentController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                });

                // Cash Out
                Route::prefix('cash-out')->name('cash.out.')->middleware(['module:cash_out'])->controller('CashOutController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                });

                // Request Money
                Route::prefix('request-money')->middleware(['module:request_money'])->name('request.money.')->controller('RequestMoneyController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');

                    Route::get('received-history', 'requestHistory')->name('received.history');
                    Route::get('received-details/{id}', 'requestDetails')->name('received.details');
                    Route::get('received-details-view/{id}', 'requestDetailsView')->name('received.details.view');
                    Route::post('received-store/{id}', 'requestStore');
                    Route::post('reject/{id}', 'rejectRequest');
                    Route::get('received-pdf/{id}', 'requestPdf')->name('received.pdf');
                });

                // Mobile Recharge | airtime
                Route::prefix('mobile-recharge')->name('airtime.')->middleware(['module:mobile_recharge'])->controller('AirTimeController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('/history', 'history')->name('history');
                    Route::get('number/look-up', 'numberLookUp')->name('number.look.up');
                    Route::get('amount/validate', 'amountValidate')->name('amount.validate');
                });

                // Donation
                Route::prefix('donation')->name('donation.')->controller('DonationController')->middleware(['module:donation'])->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                });

                // Utility Bill
                Route::prefix('utility-bill')->name('utility.bill.')->middleware(['module:utility_bill'])->controller('UtilityBillController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                    Route::get('form', 'form')->name('form');

                    Route::post('user-company/delete/{id}', 'deleteUserCompany');
                    Route::get('get-companies', 'getCompanies')->name('get.companies');
                });

                // Gift Card
                Route::prefix('gift-card')->name('gift.card.')->middleware(['module:gift_card'])->controller('GiftCardController')->group(function () {
                    Route::get('create', 'create')->name('create');
                    Route::get('show/{id}', 'show')->name('show');
                    Route::post('purchase/{id}', 'purchase');
                    Route::get('history', 'history')->name('history');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                });

                //Investment
                Route::prefix('investment')->name('investment.')->middleware(['module:investment'])->controller('InvestmentController')->group(function () {
                    Route::get('all', 'all')->name('all');
                    Route::get('show/{id}', 'show')->name('show');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('history', 'history')->name('history');
                });

                // Education Fee
                Route::prefix('education-fee')->name('education.fee.')->middleware(['module:education_fee'])->controller('EducationFeeController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                    Route::get('form/{id}', 'form')->name('form');
                });

                // Micro Finance
                Route::prefix('microfinance')->name('microfinance.')->controller('MicroFinanceController')->middleware(['module:microfinance'])->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('/history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                    Route::get('form/{id}', 'form')->name('form');
                });

                // Bank Transfer
                Route::prefix('bank-transfer')->name('bank.transfer.')->middleware(['module:bank_transfer'])->controller('BankTransferController')->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::post('store', 'store');
                    Route::get('details/{id}', 'details')->name('details');
                    Route::get('history', 'history')->name('history');
                    Route::get('pdf/{id}', 'pdf')->name('pdf');
                    Route::post('account', 'account');
                    Route::get('account-details/{bankId}', 'accountDetails')->name('account.details');
                    Route::post('/delete/account/{id}', 'deleteAccount');
                });

                Route::prefix('verification-process')->name('verification.process.')->controller('VerificationProcessController')->group(function () {
                    Route::post('verify/otp', 'verifyOtp');
                    Route::post('verify/pin', 'verifyPin');
                    Route::post('verify/resend/code', 'resendCode');
                });

                Route::prefix('virtual-card')->name('virtual.card.')->middleware(['module:virtual_card'])->controller('VirtualCardController')->group(function () {
                    Route::get('list', 'list')->name('list');
                    Route::get('new', 'newCard')->name('new');
                    Route::get('view/{id}', 'view')->name('view');
                    Route::post('store', 'store');
                    Route::post('add/fund/{id}', 'addFund');
                    Route::post('cancel/{id}', 'cancel');
                    Route::any('confidential/{id}', 'confidential')->name('confidential');
                });
            });
        });

        // Payment
        Route::prefix('deposit')->name('deposit.')->middleware(['module:add_money', 'kyc'])->controller('Gateway\PaymentController')->group(function () {
            Route::any('/', 'deposit')->name('index');
            Route::post('insert', 'depositInsert');
            Route::get('confirm', 'depositConfirm')->name('confirm');
            Route::get('manual', 'manualDepositConfirm')->name('manual.confirm');
            Route::post('manual', 'manualDepositUpdate');
        });

        Route::get('deposit/swan/callback/{trx}', 'Gateway\Swan\ProcessController@callback')->name('deposit.swan.callback');
    });
});
