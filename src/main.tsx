import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './i18n/i18n';
import App from './app/App';
import DeepayLandingPage from './app/pages/DeepayLandingPage';
import { LanguageProvider } from './i18n/LanguageProvider';

/**
 * Device detection: mobile users get the banking app, desktop users get the landing page.
 * UA takes priority; screen width is only used as fallback for non-UA-identified devices.
 */
function isMobileDevice(): boolean {
  const uaMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  // Use matchMedia for reliable CSS-breakpoint-level detection
  const narrowScreen = window.matchMedia('(max-width: 767px)').matches;
  return uaMobile || narrowScreen;
}

/** Root component — re-renders on viewport resize so switching orientations works */
function RootApp() {
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => {
      setIsMobile(isMobileDevice());
    };
    // Modern browsers
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      mq.addListener(handler); // Safari < 14 fallback
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, []);

  return (
    <LanguageProvider>
      {isMobile ? <App /> : <DeepayLandingPage />}
    </LanguageProvider>
  );
}

function mountApp() {
  const container = document.getElementById('root');
  if (!container) {
    console.error('[DeePay] #root element not found — cannot mount React app.');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <RootApp />
      </StrictMode>,
    );

    // Hide the startup shell once React has mounted
    const shell = document.getElementById('deepay-startup-shell');
    if (shell) {
      shell.classList.add('hidden');
      // Remove from DOM after transition
      shell.addEventListener('transitionend', () => shell.remove(), { once: true });
    }
  } catch (err) {
    console.error('[DeePay] React failed to mount:', err);
    // If React crashes, show a user-friendly error instead of a blank page
    const shell = document.getElementById('deepay-startup-shell');
    if (shell) {
      shell.innerHTML = `
        <div style="text-align:center;padding:32px;max-width:400px">
          <div style="font-size:48px;margin-bottom:16px">⚠️</div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Qualcosa è andato storto</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin-bottom:24px">
            Impossibile caricare l'applicazione. Prova ad aggiornare la pagina.
          </p>
          <button onclick="location.reload()" style="background:#10B981;color:#fff;border:none;border-radius:999px;padding:12px 28px;font-size:14px;font-weight:600;cursor:pointer">
            Ricarica
          </button>
        </div>
      `;
    }
  }
}

mountApp();
