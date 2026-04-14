# DeePay

Piattaforma di pagamenti aziendali per l'Italia e l'Europa.

## Stack

- **Backend**: Laravel 11 (in `core/`) — API, auth, gestione utenti
- **Frontend desktop**: React + Tailwind v4 (in `src/`) — landing page stile fintech
- **Frontend mobile**: React PWA (stesso bundle) — app bancaria con 4 tab + QR
- **Template Blade**: `core/resources/views/templates/basic/` — layout e viste Laravel

## Sviluppo locale

```bash
# Installa dipendenze PHP (Laravel)
cd core && composer install

# Installa dipendenze Node (React frontend)
npm install          # nella root del progetto

# Build produzione del frontend React
npm run build        # genera dist/assets/app.js e dist/assets/index.css

# Sviluppo con hot-reload
npm run dev          # Vite dev server su http://localhost:5173
```

## Deploy su Nginx

Vedi [`NGINX.md`](./NGINX.md) per la configurazione completa di Nginx, inclusa la soluzione al problema "startup shell bloccata" (React non si monta).

**Problema comune**: Se il sito mostra solo il messaggio di startup e React non si monta, quasi sempre il motivo è che Nginx sta servendo i file `.js`/`.css` come `text/html` (li passa a Laravel invece di servirli staticamente). Vedi NGINX.md §Troubleshooting.

## Struttura frontend (`src/`)

```
src/
├── main.tsx                    # Entry point — rileva dispositivo (mobile/desktop)
├── styles/
│   ├── index.css               # Entry CSS (Tailwind v4 + fonts + tema)
│   ├── tailwind.css            # @import tailwindcss
│   ├── fonts.css               # Inter + Outfit da Google Fonts
│   └── theme.css               # CSS custom properties (colori, raggi, ecc.)
└── app/
    ├── App.tsx                 # Banking app mobile (4 tab + QR)
    ├── pages/
    │   └── DeepayLandingPage.tsx  # Landing page desktop (stile deblock.com)
    └── components/
        ├── HomePage.tsx        # Tab Home: saldo, IBAN, Add Money, Transfer
        ├── CardsPage.tsx       # Tab Carte: card mockup + azioni + Google Wallet
        ├── VaultsPage.tsx      # Tab Portafoglio: crypto + fiat con bilanci
        ├── QRCodePage.tsx      # QR code incasso per commerciante
        ├── TransferPage.tsx    # Trasferimento fondi
        └── SplashScreen.tsx    # Schermata di avvio animata
```

## PWA

Il file `manifest.json` e `sw.js` sono configurati per:
- **Standalone mode** (senza barra del browser) su Android e iOS
- **Shortcuts**: Ricarica, Scansiona QR, Trasferisci (visibili dal launcher Android)
- **Service Worker v3**: cache-first per asset statici, **mai** cache per HTML (evita startup shell bloccata)

## Architettura dispositivo

```
Utente apre deepay.srl/
  │
  ├── Dispositivo mobile → App bancaria (React PWA)
  │     Navigation: Home · Cripto · [QR] · Carte · Portafoglio
  │
  └── Desktop → Landing page (stile fintech)
        Hero · KPI band · Feature cards · CTA · Footer
```
