<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SecurityLogController extends Controller
{
    /**
     * Scan web server log files for attack patterns (XSS, SQL injection, scanner, PHP injection).
     */
    public function index(Request $request)
    {
        $pageTitle = 'Security Log Analysis';

        $logPaths = $this->discoverLogFiles();
        $results  = [];
        $stats    = ['xss' => 0, 'sql' => 0, 'scan' => 0, 'php' => 0, 'total' => 0];
        $errors   = [];

        $filterType  = $request->get('type', 'all');
        $filterLimit = (int)$request->get('limit', 500);
        $filterLimit = max(50, min(5000, $filterLimit));

        $patterns = $this->attackPatterns();

        foreach ($logPaths as $logPath) {
            if (!file_exists($logPath) || !is_readable($logPath)) {
                continue;
            }

            try {
                $lines = $this->tailFile($logPath, 20000);
            } catch (\Exception $e) {
                $errors[] = "Cannot read: $logPath — " . $e->getMessage();
                continue;
            }

            foreach ($lines as $lineNo => $line) {
                if (empty(trim($line))) {
                    continue;
                }
                foreach ($patterns as $type => $typePatterns) {
                    if ($filterType !== 'all' && $filterType !== $type) {
                        continue;
                    }
                    foreach ($typePatterns as $pattern) {
                        if (stripos($line, $pattern) !== false) {
                            $stats[$type]++;
                            $stats['total']++;
                            if (count($results) < $filterLimit) {
                                $results[] = [
                                    'file'    => basename($logPath),
                                    'line'    => $lineNo + 1,
                                    'type'    => $type,
                                    'pattern' => $pattern,
                                    'content' => mb_substr($line, 0, 300),
                                    'ip'      => $this->extractIp($line),
                                    'time'    => $this->extractTime($line),
                                ];
                            }
                            break 2; // one match per line
                        }
                    }
                }
            }
        }

        return view('admin.reports.security_logs', compact(
            'pageTitle', 'results', 'stats', 'errors',
            'filterType', 'filterLimit', 'logPaths'
        ));
    }

    /** Discover log file locations (nginx, apache, Laravel) */
    private function discoverLogFiles(): array
    {
        $candidates = [
            '/www/wwwlogs/www.deepay.srl.access.log',
            '/www/wwwlogs/www.deepay.srl.error.log',
            '/www/wwwlogs/deepay.srl.access.log',
            '/var/log/nginx/access.log',
            '/var/log/nginx/error.log',
            '/var/log/apache2/access.log',
            '/var/log/apache2/error.log',
            storage_path('logs/laravel.log'),
        ];

        $found = [];
        foreach ($candidates as $path) {
            if (file_exists($path) && is_readable($path)) {
                $found[] = $path;
            }
        }

        // Also include all Laravel log files
        $laravelLogs = glob(storage_path('logs/*.log')) ?: [];
        foreach ($laravelLogs as $log) {
            if (!in_array($log, $found)) {
                $found[] = $log;
            }
        }

        return $found;
    }

    /** Attack signature patterns per category */
    private function attackPatterns(): array
    {
        return [
            'xss' => [
                '<script', 'javascript:', 'onerror=', 'onload=', 'onclick=', 'alert(',
                'prompt(', 'confirm(', 'document.cookie', 'document.write',
                'eval(', 'expression(', 'vbscript:', 'onmouseover=',
                '%3cscript', '%3Cscript', 'xss', 'svg/onload',
            ],
            'sql' => [
                "' or '", "' OR '", 'UNION SELECT', 'union select', 'UNION ALL SELECT',
                'DROP TABLE', 'drop table', 'INSERT INTO', "1=1", "1 = 1",
                '--', '/*', '*/', 'xp_cmdshell', 'exec(', 'EXEC(',
                "'; --", 'char(', 'CHAR(', 'CAST(', 'CONVERT(',
                'information_schema', 'INFORMATION_SCHEMA', 'sys.tables',
            ],
            'scan' => [
                'wp-admin', 'wp-login', 'setup-config.php', 'xmlrpc.php',
                '.env', '/.git', '/vendor/', 'phpinfo()', 'phpmyadmin',
                'shell.php', 'c99.php', 'r57.php', 'webshell',
                '../', '..\\', '%2e%2e', 'etc/passwd', 'etc/shadow',
                'proc/self', '/bin/bash', 'cmd.exe',
            ],
            'php' => [
                'system(', 'exec(', 'passthru(', 'shell_exec(', 'popen(',
                'proc_open(', 'base64_decode(', 'gzinflate(', 'eval(',
                '<?php', '<?=', 'assert(', 'preg_replace.*e',
                'file_get_contents(', 'include(', 'require(',
                'move_uploaded_file(', 'phpinfo',
            ],
        ];
    }

    /** Read last N lines of a file efficiently */
    private function tailFile(string $path, int $lines = 10000): array
    {
        $size = filesize($path);
        if ($size === 0) {
            return [];
        }

        // For files under 5 MB read entirely; otherwise tail from end
        if ($size < 5 * 1024 * 1024) {
            return file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        }

        $fp     = fopen($path, 'rb');
        $result = [];
        $buffer = '';
        $pos    = $size;
        $chunk  = 4096;
        $found  = 0;

        while ($pos > 0 && $found < $lines) {
            $readSize = min($chunk, $pos);
            $pos     -= $readSize;
            fseek($fp, $pos);
            $buffer = fread($fp, $readSize) . $buffer;
            $found  = substr_count($buffer, "\n");
        }
        fclose($fp);

        $allLines = explode("\n", $buffer);
        // Return last $lines lines
        return array_slice($allLines, -$lines);
    }

    /** Extract IP from a log line */
    private function extractIp(string $line): string
    {
        if (preg_match('/\b(\d{1,3}(?:\.\d{1,3}){3})\b/', $line, $m)) {
            return $m[1];
        }
        return '—';
    }

    /** Extract timestamp from a log line */
    private function extractTime(string $line): string
    {
        if (preg_match('/\[([^\]]+)\]/', $line, $m)) {
            return $m[1];
        }
        return '—';
    }
}
