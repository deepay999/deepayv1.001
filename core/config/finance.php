<?php

return [
    'system_accounts' => [
        'fee_revenue' => 'SYSTEM_FEE_REVENUE',
        'fx_revenue' => 'SYSTEM_FX_REVENUE',
        'risk_hold' => 'SYSTEM_RISK_HOLD',
        'settlement_clearing' => 'SYSTEM_SETTLEMENT_CLEARING',
        'manual_adjustment' => 'SYSTEM_MANUAL_ADJUSTMENT',
        'reconciliation' => 'SYSTEM_RECONCILIATION',
    ],

    'reconciliation' => [
        'repair_threshold' => '0.00000001',
    ],

    'webhooks' => [
        'max_skew_seconds' => 300,
    ],
];