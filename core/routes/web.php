<?php

use App\Constants\Status;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/swan', 'Webhooks\BankingWebhookController@swan')->name('webhooks.swan');
Route::post('/webhooks/airwallex', 'Webhooks\BankingWebhookController@airwallex')->name('webhooks.airwallex');

Route::get('/clear', function () {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
});

Route::get('/app/{any?}', function () {
    $bootstrap = [
        'siteName'     => gs('site_name'),
        'currency'     => [
            'symbol' => gs('cur_sym'),
            'code'   => gs('cur_text'),
        ],
        'user'         => null,
        'cards'        => [],
        'transactions' => [],
        'metrics'      => [
            'activeCardCount'         => 0,
            'totalCardCount'          => 0,
            'totalCardBalance'        => 0,
            'formattedTotalCardBalance' => showAmount(0),
            'transactionCount'        => 0,
            'topUpCount'              => 0,
        ],
    ];

    $user = auth()->user();

    if ($user) {
        $cardQuery       = $user->virtualCards();
        $allCardCount    = (clone $cardQuery)->count();
        $activeCardCount = (clone $cardQuery)->where('status', Status::VIRTUAL_CARD_ACTIVE)->count();
        $cards           = $cardQuery->with('cardHolder')->take(6)->get();
        $transactions    = $user->transactions()->take(12)->get();
        $totalCardBalance = (float) $cards->sum('balance');

        $bootstrap['user'] = [
            'id'             => $user->id,
            'name'           => $user->fullname,
            'initials'       => $user->full_name_short_form,
            'email'          => $user->email,
            'balance'        => (float) $user->balance,
            'formattedBalance' => showAmount($user->balance),
            'countryName'    => $user->country_name,
            'mobileNumber'   => $user->mobile_number,
            'imageSrc'       => $user->image_src,
            'kycStatus'      => match ((int) $user->kv) {
                Status::KYC_VERIFIED => 'verified',
                Status::KYC_PENDING => 'pending',
                default => 'unverified',
            },
            'joinedAt'       => optional($user->created_at)?->toIso8601String(),
        ];

        $bootstrap['cards'] = $cards->map(function ($card) {
            return [
                'id'             => $card->id,
                'name'           => $card->name ?: optional($card->cardHolder)->name ?: __('DeePay Card'),
                'type'           => (int) $card->usability_type === Status::VIRTUAL_CARD_ONETIME ? 'one_time' : 'reusable',
                'brand'          => $card->brand,
                'maskedNumber'   => printVirtualCardNumber($card),
                'expiry'         => sprintf('%02d/%s', (int) $card->exp_month, substr((string) $card->exp_year, -2)),
                'balance'        => (float) $card->balance,
                'formattedBalance' => showAmount($card->balance),
                'status'         => match ((int) $card->status) {
                    Status::VIRTUAL_CARD_ACTIVE => 'active',
                    Status::VIRTUAL_CARD_CLOSED => 'closed',
                    default => 'inactive',
                },
                'cardholderName' => optional($card->cardHolder)->name,
            ];
        })->values()->all();

        $bootstrap['transactions'] = $transactions->map(function ($transaction) {
            return [
                'id'              => $transaction->id,
                'trx'             => $transaction->trx,
                'remark'          => $transaction->remark,
                'type'            => $transaction->trx_type === '+' ? 'credit' : 'debit',
                'amount'          => (float) $transaction->amount,
                'formattedAmount' => ($transaction->trx_type === '+' ? '+' : '-') . showAmount($transaction->amount, currencyFormat: false),
                'details'         => $transaction->details,
                'createdAt'       => optional($transaction->created_at)?->toIso8601String(),
                'postBalance'     => (float) $transaction->post_balance,
            ];
        })->values()->all();

        $bootstrap['metrics'] = [
            'activeCardCount'           => $activeCardCount,
            'totalCardCount'            => $allCardCount,
            'totalCardBalance'          => $totalCardBalance,
            'formattedTotalCardBalance' => showAmount($totalCardBalance),
            'transactionCount'          => $user->transactions()->count(),
            'topUpCount'                => $user->transactions()->where('remark', 'add_money')->count(),
        ];
    }

    return view('spa', compact('bootstrap'));
})->where('any', '.*');

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

    Route::get('/{slug}', 'pages')->name('pages');
    Route::get('/', 'index')->name('home');
});
