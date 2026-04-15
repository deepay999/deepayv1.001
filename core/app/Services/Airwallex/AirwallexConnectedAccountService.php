<?php

namespace App\Services\Airwallex;

use RuntimeException;

class AirwallexConnectedAccountService
{
    public function __construct(private AirwallexClient $client)
    {
    }

    public function createForCustomer(string $businessName, string $email, array $overrides = []): array
    {
        $payload = array_replace_recursive([
            'account_details' => [
                'business_details' => [
                    'business_name' => $businessName,
                ],
            ],
            'customer_agreements' => [
                'agreed_to_data_usage' => true,
                'agreed_to_terms_and_conditions' => true,
            ],
            'primary_contact' => [
                'email' => $email,
            ],
        ], $overrides);

        $response = $this->client->createConnectedAccount($payload);
        $accountId = $response['id'] ?? $response['account_id'] ?? null;

        if (!$accountId) {
            throw new RuntimeException('Airwallex connected account creation did not return an account identifier');
        }

        return [
            'account_id' => $accountId,
            'response' => $response,
        ];
    }

    public function createGlobalAccountForConnectedAccount(string $connectedAccountId, array $payload): array
    {
        return $this->client->createGlobalAccount($payload, $connectedAccountId);
    }

    public function createConversionForConnectedAccount(string $connectedAccountId, array $payload): array
    {
        return $this->client->createConversion($payload, $connectedAccountId);
    }
}