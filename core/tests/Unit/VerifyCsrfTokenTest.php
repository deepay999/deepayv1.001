<?php

namespace Tests\Unit;

use App\Http\Middleware\VerifyCsrfToken;
use PHPUnit\Framework\TestCase;

class VerifyCsrfTokenTest extends TestCase
{
    public function test_webhook_routes_are_exempt_from_csrf_verification(): void
    {
        $except = (new \ReflectionClass(VerifyCsrfToken::class))->getDefaultProperties()['except'] ?? [];

        $this->assertContains('/webhooks/*', $except);
    }
}