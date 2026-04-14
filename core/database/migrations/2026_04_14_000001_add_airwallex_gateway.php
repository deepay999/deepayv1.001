<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Gateway code chosen to avoid conflicts with existing gateways:
     * 120=Authorize, 122=2Checkout, 123=Checkout, 124=Alipay, 125=WechatPay, 129=Swan
     */
    private const GATEWAY_CODE = 126;

    public function up(): void
    {
        if (DB::table('gateways')->where('alias', 'Airwallex')->exists()) {
            return;
        }

        DB::table('gateways')->insert([
            'form_id'              => 0,
            'code'                 => self::GATEWAY_CODE,
            'name'                 => 'Airwallex',
            'alias'                => 'Airwallex',
            'image'                => '',
            'status'               => 0,
            'gateway_parameters'   => json_encode([
                'client_id' => [
                    'title'  => 'Client ID',
                    'global' => true,
                    'value'  => '',
                ],
                'api_key' => [
                    'title'  => 'API Key',
                    'global' => true,
                    'value'  => '',
                ],
                'environment' => [
                    'title'  => 'Environment (demo / production)',
                    'global' => true,
                    'value'  => 'demo',
                ],
            ]),
            'supported_currencies' => json_encode([
                'AUD' => 'AUD', 'CAD' => 'CAD', 'CNY' => 'CNY', 'EUR' => 'EUR',
                'GBP' => 'GBP', 'HKD' => 'HKD', 'JPY' => 'JPY', 'SGD' => 'SGD',
                'USD' => 'USD',
            ]),
            'crypto'               => 0,
            'extra'                => null,
            'description'          => null,
            'input_form'           => null,
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        // Default USD currency so the gateway can be tested immediately
        if (!DB::table('gateway_currencies')->where('method_code', self::GATEWAY_CODE)->where('currency', 'USD')->exists()) {
            DB::table('gateway_currencies')->insert([
                'name'              => 'Airwallex - USD',
                'currency'          => 'USD',
                'symbol'            => '$',
                'method_code'       => self::GATEWAY_CODE,
                'gateway_alias'     => 'Airwallex',
                'min_amount'        => 1.00,
                'max_amount'        => 10000.00,
                'percent_charge'    => 0.00,
                'fixed_charge'      => 0.00,
                'rate'              => 1.00,
                'gateway_parameter' => json_encode([
                    'client_id'   => '',
                    'api_key'     => '',
                    'environment' => 'demo',
                ]),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('gateway_currencies')->where('method_code', self::GATEWAY_CODE)->delete();
        DB::table('gateways')->where('alias', 'Airwallex')->delete();
    }
};
