<?php

namespace Tests\Unit;

use App\Services\Finance\Webhooks\BankingWebhookSupport;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class BankingWebhookSupportTest extends TestCase
{
    public function test_it_reads_nested_gateway_parameter_values(): void
    {
        $support = new BankingWebhookSupport();
        $parameters = json_decode(json_encode([
            'webhook_secret' => ['title' => 'Webhook Secret', 'value' => 'secret-value'],
            'webhook_signature_header' => ['title' => 'Webhook Signature Header', 'value' => 'X-Test-Signature'],
        ]));

        $this->assertSame('secret-value', $support->parameterValue($parameters, 'webhook_secret'));
        $this->assertSame('X-Test-Signature', $support->parameterValue($parameters, 'webhook_signature_header'));
    }

    public function test_it_resolves_success_states_from_nested_parameter_values(): void
    {
        $support = new BankingWebhookSupport();
        $parameters = json_decode(json_encode([
            'webhook_success_statuses' => ['title' => 'Statuses', 'value' => 'SUCCEEDED, SETTLED , SUCCESS'],
        ]));

        $this->assertSame(['SUCCEEDED', 'SETTLED', 'SUCCESS'], $support->resolveSuccessStates($parameters, 'webhook_success_statuses', 'FAILED'));
    }

    public function test_it_extracts_timestamp_from_iso_string_and_unix_timestamp(): void
    {
        $support = new BankingWebhookSupport();

        $isoTimestamp = $support->extractTimestamp(['payload' => ['created_at' => '2026-04-15T12:30:00Z']], ['created_at']);
        $unixTimestamp = $support->extractTimestamp(['timestamp' => 1713189000], ['timestamp']);

        $this->assertSame('2026-04-15T12:30:00+00:00', $isoTimestamp?->toIso8601String());
        $this->assertSame('2024-04-15T13:50:00+00:00', $unixTimestamp?->toIso8601String());
    }

    public function test_it_detects_stale_timestamp_and_hashes_payload_stably(): void
    {
        $support = new BankingWebhookSupport();

        Carbon::setTestNow('2026-04-15 12:00:00');

        $fresh = Carbon::parse('2026-04-15 11:56:00');
        $stale = Carbon::parse('2026-04-15 11:40:00');
        $hashA = $support->payloadHash(['b' => 2, 'a' => ['y' => 2, 'x' => 1]]);
        $hashB = $support->payloadHash(['a' => ['x' => 1, 'y' => 2], 'b' => 2]);

        $this->assertTrue($support->isFresh($fresh, 300));
        $this->assertFalse($support->isFresh($stale, 300));
        $this->assertSame($hashA, $hashB);

        Carbon::setTestNow();
    }
}