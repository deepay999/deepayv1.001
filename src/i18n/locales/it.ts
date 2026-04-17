/**
 * Italian fallback translations — lingua principale della piattaforma.
 * Utilizzato quando l'endpoint backend /api/language/it non è disponibile.
 */
const it: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   'Prodotto',
  'nav.security':  'Sicurezza',
  'nav.pricing':   'Prezzi',
  'nav.blog':      'Blog',
  'nav.login':     'Accedi',
  'nav.register':  'Apri conto gratuito',
  'nav.openMenu':  'Apri menu',

  /* ── Hero ── */
  'hero.badge':         "Conforme PSD2 · Autorizzata da Banca d'Italia",
  'hero.headline1':     'Il futuro dei',
  'hero.headline2':     'pagamenti aziendali',
  'hero.headline3':     '',
  'hero.sub':           "DeePay è la piattaforma finanziaria pensata per le imprese italiane ed europee. Bonifici istantanei, carte aziendali e incassi — in un'unica soluzione.",
  'hero.cta_primary':   'Inizia gratis',
  'hero.cta_secondary': 'Scopri il prodotto',

  /* ── Trust badges ── */
  'trust.psd2': 'Conforme PSD2',
  'trust.gdpr': 'GDPR Ready',
  'trust.iso':  'ISO 27001',
  'trust.soc2': 'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label':    'Volume pagamenti annuo',
  'kpi.countries_label': 'Paesi europei coperti',
  'kpi.auth_label':      'Tempo medio di autorizzazione',

  /* ── Features ── */
  'features.label':          'Funzionalità',
  'features.headline':       'Tutto ciò di cui hai bisogno,',
  'features.headline_muted': 'senza compromessi',
  'features.sub':            'Una piattaforma completa progettata per le esigenze delle PMI e delle grandi aziende italiane.',

  'feature.instant_payments.title': 'Pagamenti Istantanei',
  'feature.instant_payments.desc':  'Bonifici SEPA in tempo reale e pagamenti internazionali elaborati in pochi secondi, 24/7 — inclusi weekend e festività.',
  'feature.corporate_cards.title':  'Carte Aziendali',
  'feature.corporate_cards.desc':   'Emetti carte fisiche e virtuali per ogni dipendente con limiti personalizzati, categorie di spesa e riconciliazione automatica.',
  'feature.european_coverage.title':'Copertura Europea',
  'feature.european_coverage.desc': "Opera in oltre 30 paesi dell'area euro con conti multi-valuta, conversione automatica e conformità PSD2 integrata.",
  'feature.enterprise_security.title': 'Sicurezza Enterprise',
  'feature.enterprise_security.desc':  "Autenticazione forte, monitoraggio antifrode in tempo reale e architettura zero-trust conforme alle direttive EBA.",
  'feature.api.title': 'API & Integrazioni',
  'feature.api.desc':  'API REST documentate, webhook e connettori nativi per SAP, Oracle, Salesforce e i principali ERP.',
  'feature.analytics.title': 'Analytics Avanzata',
  'feature.analytics.desc':  'Dashboard in tempo reale con previsioni di cash-flow, riconciliazione automatica e report pronti per la dichiarazione fiscale.',

  /* ── How it works ── */
  'how.label':    'Come funziona',
  'how.headline': 'Operativo in pochi minuti',

  'how.step1.title': 'Apri un conto',
  'how.step1.desc':  'Registrazione digitale in meno di 10 minuti. KYC online senza appuntamenti in filiale.',
  'how.step2.title': 'Connetti la tua azienda',
  'how.step2.desc':  'Importa il piano dei conti, collega il tuo ERP e invita il team con ruoli granulari.',
  'how.step3.title': 'Inizia a pagare',
  'how.step3.desc':  'Emetti pagamenti, approva le spese e monitora il cash-flow da un unico pannello.',

  /* ── Security ── */
  'security.label':    'Sicurezza',
  'security.headline': 'Sicurezza di livello bancario',
  'security.desc':     "Ogni transazione è protetta da cifratura end-to-end, autenticazione a due fattori e monitoraggio antifrode in tempo reale. Conformità EBA e Banca d'Italia garantita.",

  /* ── CTA Section ── */
  'cta.headline1': 'Pronto a modernizzare',
  'cta.headline2': 'i tuoi pagamenti?',
  'cta.sub':       'Unisciti alle centinaia di aziende italiane che hanno già scelto DeePay per gestire i loro flussi di cassa.',
  'cta.primary':   'Apri conto gratuito',
  'cta.secondary': 'Parla con un esperto',

  /* ── Footer ── */
  'footer.tagline':          "La piattaforma di pagamenti aziendali per l'Italia e l'Europa.",
  'footer.col.product':      'Prodotto',
  'footer.col.company':      'Azienda',
  'footer.col.support':      'Supporto',
  'footer.product.features': 'Funzionalità',
  'footer.product.pricing':  'Prezzi',
  'footer.product.security': 'Sicurezza',
  'footer.product.api':      'API',
  'footer.company.about':    'Chi siamo',
  'footer.company.blog':     'Blog',
  'footer.company.careers':  'Lavora con noi',
  'footer.company.contact':  'Contatti',
  'footer.support.help':     'Centro assistenza',
  'footer.support.status':   'Stato servizi',
  'footer.support.developers': 'Sviluppatori',
  'footer.support.terms':    'Termini & Privacy',
  'footer.copyright':        '© {{year}} DeePay S.r.l. — Tutti i diritti riservati',
  'footer.status':           'Servizi operativi',

  /* ── App tabs ── */
  'tab.home':     'Home',
  'tab.wallet':   'Portafoglio',
  'tab.transfer': 'Bonifico',
  'tab.iban':     'IBAN',
  'tab.activity': 'Movimenti',
  'tab.points':   'Punti',

  /* ── Language dropdown ── */
  'lang.it': 'Italiano',
  'lang.en': 'English',
  'lang.fr': 'Français',
  'lang.de': 'Deutsch',
  'lang.es': 'Español',
  'lang.pt': 'Português',
  'lang.ar': 'العربية',
  'lang.zh': '中文',

  /* ── Landing page nav ── */
  'Discover':     'Scopri',
  'Pricing plan': 'Piani e prezzi',
  'Login':        'Accedi',
  'Sign up':      'Registrati',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'Prendi il controllo del tuo denaro',
  'Current account':            'Conto corrente',
  'VISA card':                  'Carta VISA',
  'Crypto wallet':              'Portafoglio crypto',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': 'Unisciti a centinaia di migliaia di utenti',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'Dimentica la tua banca tradizionale',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay offre: IBAN, carte, bonifici istantanei, cambio valuta e crypto — tutto gratis, senza commissioni bancarie.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card':   'Distinguiti con una carta di debito unica!',
  'Pay worldwide, bind Alipay & WeChat':  'Paga ovunque nel mondo',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'Deposita le tue crypto senza limiti',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'Deposita e preleva crypto senza alcuna restrizione. Converti in EUR o altre crypto in qualsiasi momento.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'La tua sicurezza è la nostra priorità',
  '24/7 AI support with human agents available when you need them':
    'Supporto AI 24/7 con operatori umani disponibili quando ne hai bisogno',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': "L'app di finanza digitale per tutti.",

  /* ── Landing page footer columns ── */
  'Company':     'Azienda',
  'Home':        'Home',
  'About':       'Chi siamo',
  'Press':       'Stampa',
  'Career':      'Carriera',
  'Ambassadors': 'Ambasciatori',
  'Verify':      'Verifica',
  'Status':      'Stato',
  'Product':     'Prodotto',
  'Features':    'Funzionalità',
  'Business':    'Business',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market':   'Mercato Crypto',
  'Exchange':    'Cambio',
  'Suggestions': 'Suggerimenti',
  'Help':        'Aiuto',
  'Contact':     'Contatti',
  'Twitter':     'Twitter',
  'FAQ':         'FAQ',
  'Legal & Compliance': 'Legale & Compliance',
  'Legal Agreements':   'Accordi legali',
  'Website terms':      'Termini del sito',
  'Privacy':            'Privacy',
  'All rights reserved.': 'Tutti i diritti riservati.',
  'Services operational': 'Servizi operativi',
};

export default it;
