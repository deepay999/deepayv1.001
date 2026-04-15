<?php

namespace App\Console\Commands\Finance;

use App\Services\Airwallex\AirwallexWebhookService;
use Illuminate\Console\Command;
use Throwable;

class AirwallexSetupWebhookCommand extends Command
{
    protected $signature = 'airwallex:setup-webhook
        {--url= : The public webhook URL (e.g. https://deepay.srl/webhooks/airwallex)}
        {--full : Register payout events in addition to deposit and account events}
        {--list : List currently registered webhooks instead of creating one}';

    protected $description = 'Register a webhook endpoint with Airwallex for deposit and account events';

    public function handle(AirwallexWebhookService $webhookService): int
    {
        if ($this->option('list')) {
            return $this->listWebhooks($webhookService);
        }

        $url = $this->option('url');
        if (!$url) {
            $url = rtrim(config('app.url'), '/') . '/webhooks/airwallex';
            if (!$this->confirm("Register webhook at: {$url}?")) {
                return self::FAILURE;
            }
        }

        $this->info("Registering webhook at: {$url}");

        try {
            if ($this->option('full')) {
                $result = $webhookService->registerFullWebhook($url);
            } else {
                $result = $webhookService->registerDepositWebhook($url);
            }

            $this->info('Webhook registered successfully.');
            $this->table(
                ['Field', 'Value'],
                [
                    ['Webhook ID', $result['id'] ?? 'N/A'],
                    ['URL', $result['url'] ?? $url],
                    ['Active', ($result['active'] ?? false) ? 'Yes' : 'No'],
                    ['Events', count($result['events'] ?? []) . ' events'],
                    ['Secret', $result['secret'] ?? 'N/A (save this to gateway config!)'],
                ]
            );

            if (!empty($result['secret'])) {
                $this->warn('IMPORTANT: Copy the secret above and paste it into the Airwallex gateway "Webhook Secret" field in admin panel.');
            }

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to register webhook: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    private function listWebhooks(AirwallexWebhookService $webhookService): int
    {
        try {
            $result = $webhookService->listRegistered();
            $items = $result['items'] ?? $result;

            if (empty($items)) {
                $this->info('No webhooks registered.');
                return self::SUCCESS;
            }

            $rows = [];
            foreach ($items as $wh) {
                $rows[] = [
                    $wh['id'] ?? 'N/A',
                    $wh['url'] ?? 'N/A',
                    ($wh['active'] ?? false) ? 'Yes' : 'No',
                    count($wh['events'] ?? []),
                ];
            }

            $this->table(['ID', 'URL', 'Active', 'Events'], $rows);
            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Failed to list webhooks: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
