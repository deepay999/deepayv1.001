{{--
  DeePay Homepage — React SPA Shell
  The React bundle (built from src/) handles both:
    • Desktop  → DeepayLandingPage (deblock-style landing)
    • Mobile   → App (banking PWA)
  Falls back to a static HTML page if JS fails.
--}}
<!doctype html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#080808" />
  <link rel="manifest" href="{{ asset('manifest.json') }}" />
  <link rel="icon" type="image/png" href="{{ asset('assets/images/logo_icon/favicon.png') }}" />
  <title>DeePay — Pagamenti aziendali per l'Italia e l'Europa</title>
  <meta name="description" content="DeePay è la piattaforma di pagamenti digitali per aziende italiane ed europee. Bonifici istantanei, carte aziendali e incassi in un'unica soluzione." />
  <meta property="og:title" content="DeePay — Pagamenti aziendali" />
  <meta property="og:description" content="Bonifici istantanei, carte corporate e incassi per le aziende italiane ed europee." />
  <meta property="og:type" content="website" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="DeePay" />

  @php $seoContents = $seoContents ?? null; @endphp
  @if($seoContents)
    {!! seoMeta($seoContents) !!}
  @endif

  <!-- Startup shell styles: shown while React loads, prevents blank page -->
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#080808;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #deepay-startup-shell{
      position:fixed;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;background:#080808;z-index:9999;
      transition:opacity .4s ease;
    }
    #deepay-startup-shell.hidden{opacity:0;pointer-events:none}
    .startup-logo{width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 100%);
      box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08);
      display:flex;align-items:center;justify-content:center;margin-bottom:24px}
    .startup-brand{font-size:28px;font-weight:700;letter-spacing:-.5px;margin-bottom:8px}
    .startup-tagline{font-size:13px;color:rgba(255,255,255,.5);letter-spacing:.15em;text-transform:uppercase;margin-bottom:40px}
    .startup-dots{display:flex;gap:8px}
    .startup-dots span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.4);animation:dp 1.2s infinite ease-in-out}
    .startup-dots span:nth-child(2){animation-delay:.2s}
    .startup-dots span:nth-child(3){animation-delay:.4s}
    @keyframes dp{0%,80%,100%{transform:scale(1);opacity:.4}40%{transform:scale(1.3);opacity:1}}
  </style>
</head>
<body>

  <!-- Startup shell: visible while React loads -->
  <div id="deepay-startup-shell" aria-hidden="true">
    <div class="startup-logo">
      <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#34D399"/>
        </linearGradient></defs>
        <path d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z" fill="url(#g)"/>
      </svg>
    </div>
    <div class="startup-brand">DeePay</div>
    <div class="startup-tagline">Piattaforma Pagamenti</div>
    <div class="startup-dots"><span></span><span></span><span></span></div>
  </div>

  <!-- React SPA root -->
  <div id="root"></div>

  <!-- React bundle (built from src/ via Vite) -->
  <script>
    // If JS fails entirely, show a friendly noscript-style message
    window.addEventListener('error', function(e) {
      var s = document.getElementById('deepay-startup-shell');
      if (s && !document.getElementById('root').childElementCount) {
        s.innerHTML = '<div style="text-align:center;padding:32px;max-width:400px">'
          + '<div style="font-size:48px;margin-bottom:16px">⚠️</div>'
          + '<h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Qualcosa è andato storto</h2>'
          + '<p style="color:rgba(255,255,255,.6);font-size:14px;margin-bottom:24px">Impossibile caricare l\'applicazione. Prova ad aggiornare la pagina.</p>'
          + '<button onclick="location.reload()" style="background:#10B981;color:#fff;border:none;border-radius:999px;padding:12px 28px;font-size:14px;font-weight:600;cursor:pointer">Ricarica</button>'
          + '</div>';
      }
    });
  </script>

  {{-- Load the Vite-built React bundle --}}
  {{-- Assets are in /dist/assets/ with predictable names (no hashes) --}}
  <link rel="stylesheet" crossorigin href="{{ asset('dist/assets/index.css') }}">
  <script type="module" crossorigin src="{{ asset('dist/assets/app.js') }}"></script>

  <!-- Service Worker registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(function(reg) {
            console.log('[DeePay SW] registered, scope:', reg.scope);
          })
          .catch(function(err) {
            console.warn('[DeePay SW] registration failed:', err);
          });
      });
    }
  </script>

  <!-- iOS PWA: Add to Home Screen prompt helper -->
  <script>
    (function() {
      var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      var isStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
      if (isIOS && !isStandalone && !sessionStorage.getItem('dp_ios_hint')) {
        sessionStorage.setItem('dp_ios_hint', '1');
        var banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:10000;'
          + 'background:#1a1a1a;color:#fff;border-radius:16px;padding:14px 16px;'
          + 'display:flex;align-items:center;gap:12px;font-size:13px;'
          + 'box-shadow:0 8px 32px rgba(0,0,0,.4)';
        banner.innerHTML = '<svg width="28" height="28" viewBox="0 0 60 60" fill="none">'
          + '<path d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z" fill="#10B981"/>'
          + '</svg>'
          + '<span style="flex:1">Aggiungi <strong>DeePay</strong> alla schermata Home: tocca <strong>□↑</strong> poi <em>"Aggiungi a Home"</em></span>'
          + '<button onclick="this.parentNode.remove()" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:18px;cursor:pointer;padding:0 4px">×</button>';
        setTimeout(function() { document.body.appendChild(banner); }, 3500);
      }
    })();
  </script>

</body>
</html>
