<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'airwallex' => [
        'api_key'        => env('AIRWALLEX_API_KEY'),
        'client_id'      => env('AIRWALLEX_CLIENT_ID'),
        'webhook_secret' => env('AIRWALLEX_WEBHOOK_SECRET'),
        'base_url'       => env('AIRWALLEX_BASE_URL', 'https://api.airwallex.com'),
    ],

    'swan' => [
        'client_id'     => env('SWAN_CLIENT_ID'),
        'client_secret' => env('SWAN_CLIENT_SECRET'),
        'sandbox'       => env('SWAN_SANDBOX', true),
        'base_url'      => env('SWAN_BASE_URL', 'https://api.swan.io'),
    ],

];
