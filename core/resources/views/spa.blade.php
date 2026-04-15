<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ gs()->siteName(__('DeePay App')) }}</title>
    <style>
        html, body {
            margin: 0;
            min-height: 100%;
            background: #050505;
            color: #ffffff;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        #app {
            min-height: 100vh;
        }

        .deepay-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background:
                radial-gradient(circle at top, rgba(16, 185, 129, 0.16), transparent 28%),
                radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.08), transparent 30%),
                linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 40%),
                #050505;
        }

        .deepay-shell__panel {
            width: min(100%, 520px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.04);
            backdrop-filter: blur(20px);
            border-radius: 32px;
            padding: 32px;
            box-shadow: 0 30px 100px rgba(0, 0, 0, 0.35);
        }

        .deepay-shell__brand {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 24px;
        }

        .deepay-shell__logo {
            width: 52px;
            height: 52px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 700;
            color: #fff;
            background: linear-gradient(135deg, #34d399, #10b981 55%, #0f172a);
            box-shadow: 0 16px 40px rgba(16, 185, 129, 0.28);
        }

        .deepay-shell__eyebrow {
            font-size: 11px;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.42);
            margin-bottom: 4px;
        }

        .deepay-shell__title {
            font-size: clamp(28px, 4vw, 42px);
            line-height: 1;
            font-weight: 600;
            letter-spacing: -0.04em;
            margin: 0;
        }

        .deepay-shell__copy {
            margin: 14px 0 24px;
            color: rgba(255, 255, 255, 0.64);
            line-height: 1.7;
            font-size: 15px;
        }

        .deepay-shell__grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .deepay-shell__stat {
            border-radius: 22px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .deepay-shell__stat-value {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.04em;
        }

        .deepay-shell__stat-value span {
            color: #34d399;
        }

        .deepay-shell__stat-label {
            margin-top: 6px;
            font-size: 12px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.52);
        }

        .deepay-shell__loader {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-top: 22px;
            color: rgba(255, 255, 255, 0.72);
            font-size: 13px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
        }

        .deepay-shell__pulse {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: #34d399;
            box-shadow: 0 0 24px rgba(52, 211, 153, 0.7);
            animation: deepay-pulse 1.4s ease-in-out infinite;
        }

        @keyframes deepay-pulse {
            0%, 100% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.25); opacity: 1; }
        }

        @media (max-width: 640px) {
            .deepay-shell__panel {
                padding: 24px;
                border-radius: 28px;
            }

            .deepay-shell__grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
    @vite('resources/js/app.tsx')
</head>
<body>
    <div id="app">
        <div class="deepay-shell">
            <div class="deepay-shell__panel">
                <div class="deepay-shell__brand">
                    <div class="deepay-shell__logo">D</div>
                    <div>
                        <div class="deepay-shell__eyebrow">钱包 卡片 代发</div>
                        <div style="font-size: 28px; font-weight: 600; letter-spacing: -0.04em;">DeePay</div>
                    </div>
                </div>

                <h1 class="deepay-shell__title">正在启动 DeePay Web App。</h1>
                <p class="deepay-shell__copy">
                    钱包、卡片与出金能力正在加载中。这个启动壳会在 React 应用挂载前避免出现空白页。
                </p>

                <div class="deepay-shell__grid">
                    <div class="deepay-shell__stat">
                        <div class="deepay-shell__stat-value">42<span>M+</span></div>
                        <div class="deepay-shell__stat-label">年化支付规模</div>
                    </div>
                    <div class="deepay-shell__stat">
                        <div class="deepay-shell__stat-value">180<span>+</span></div>
                        <div class="deepay-shell__stat-label">覆盖国家与收付款走廊</div>
                    </div>
                    <div class="deepay-shell__stat">
                        <div class="deepay-shell__stat-value">0.7<span>s</span></div>
                        <div class="deepay-shell__stat-label">平均出金授权耗时</div>
                    </div>
                </div>

                <div class="deepay-shell__loader">
                    <span class="deepay-shell__pulse"></span>
                    DeePay 正在启动
                </div>
            </div>
        </div>
    </div>
    <script>
        window.__DEEPAY_BOOTSTRAP__ = @json($bootstrap ?? []);
    </script>
    <noscript>DeePay 需要启用 JavaScript 才能渲染 Web App。</noscript>
</body>
</html>
