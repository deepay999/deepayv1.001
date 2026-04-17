<?php

use Illuminate\Support\Facades\Route;

Route::get('/clear', function () {
    // Restrict to localhost / private IP only, or require a secret key.
    // In production, unauthorized access returns 403.
    $allowed = false;

    // 1. Allow requests from localhost / private network
    $ip = request()->ip();
    if (in_array($ip, ['127.0.0.1', '::1']) || str_starts_with($ip, '10.') || str_starts_with($ip, '192.168.')) {
        $allowed = true;
    }

    // 2. Allow requests with the correct secret key
    $secret = env('CLEAR_CACHE_SECRET', '');
    if ($secret && request()->get('secret') === $secret) {
        $allowed = true;
    }

    if (!$allowed) {
        abort(403, 'Forbidden');
    }

    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    \Illuminate\Support\Facades\Log::info('/clear route executed', ['ip' => $ip]);
    return response('Cache cleared.', 200);
});

Route::get('app/deposit/confirm/{hash}', 'Gateway\PaymentController@appDepositConfirm')->name('deposit.app.confirm');
Route::get('cron', 'CronController@cron')->name('cron');

Route::controller('TicketController')->prefix('ticket')->name('ticket.')->group(function () {
    Route::get('/', 'supportTicket')->name('index');
    Route::get('new', 'openSupportTicket')->name('open');
    Route::post('create', 'storeSupportTicket')->name('store');
    Route::get('view/{ticket}', 'viewTicket')->name('view');
    Route::post('reply/{id}', 'replyTicket')->name('reply');
    Route::post('close/{id}', 'closeTicket')->name('close');
    Route::get('download/{attachment_id}', 'ticketDownload')->name('download');
});

Route::controller('SiteController')->group(function () {

    Route::post('/subscribe', 'subscribe')->name('subscribe');
    Route::get('/contact', 'contact')->name('contact');
    Route::post('/contact', 'contactSubmit');
    Route::get('/change/{lang?}', 'changeLanguage')->name('lang');
    Route::post('pusher/auth/{socketId}/{channelName}', 'pusherAuthentication');
    Route::get('cookie-policy', 'cookiePolicy')->name('cookie.policy');

    Route::get('/cookie/accept', 'cookieAccept')->name('cookie.accept');

    Route::get('blogs', 'blogs')->name('blogs');
    Route::get('blog/{slug}', 'blogDetails')->name('blog.details');

    Route::get('policy/{slug}', 'policyPages')->name('policy.pages');

    Route::get('placeholder-image/{size}', 'placeholderImage')->withoutMiddleware('maintenance')->name('placeholder.image');
    Route::get('maintenance-mode', 'maintenance')->withoutMiddleware('maintenance')->name('maintenance');

    Route::get('/', 'index')->name('home');
    Route::get('/{slug}', 'pages')->name('pages');
});
