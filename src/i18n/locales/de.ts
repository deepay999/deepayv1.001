/**
 * German fallback translations.
 * Verwendet, wenn der Backend-Endpunkt /api/language/de nicht verfügbar ist.
 */
const de: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   'Produkt',
  'nav.security':  'Sicherheit',
  'nav.pricing':   'Preise',
  'nav.blog':      'Blog',
  'nav.login':     'Anmelden',
  'nav.register':  'Kostenloses Konto eröffnen',
  'nav.openMenu':  'Menü öffnen',

  /* ── Hero ── */
  'hero.badge':         "PSD2-konform · Zugelassen von der Banca d'Italia",
  'hero.headline1':     'Die Zukunft der',
  'hero.headline2':     'Geschäftszahlungen',
  'hero.headline3':     '',
  'hero.sub':           'DeePay ist die Finanzplattform für italienische und europäische Unternehmen. Sofortüberweisungen, Firmenkarten und Einzüge — in einer Lösung.',
  'hero.cta_primary':   'Kostenlos starten',
  'hero.cta_secondary': 'Produkt entdecken',

  /* ── Trust badges ── */
  'trust.psd2': 'PSD2-konform',
  'trust.gdpr': 'DSGVO-konform',
  'trust.iso':  'ISO 27001',
  'trust.soc2': 'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label':    'Jährliches Zahlungsvolumen',
  'kpi.countries_label': 'Abgedeckte europäische Länder',
  'kpi.auth_label':      'Durchschn. Autorisierungszeit',

  /* ── Features ── */
  'features.label':          'Funktionen',
  'features.headline':       'Alles, was Sie brauchen,',
  'features.headline_muted': 'ohne Kompromisse',
  'features.sub':            'Eine vollständige Plattform für die Bedürfnisse von KMU und großen italienischen Unternehmen.',

  'feature.instant_payments.title': 'Sofortzahlungen',
  'feature.instant_payments.desc':  'Echtzeit-SEPA-Überweisungen und internationale Zahlungen in Sekunden — 24/7, auch an Wochenenden und Feiertagen.',
  'feature.corporate_cards.title':  'Firmenkarten',
  'feature.corporate_cards.desc':   'Stellen Sie physische und virtuelle Karten für jeden Mitarbeiter mit individuellen Limits, Ausgabenkategorien und automatischer Abstimmung aus.',
  'feature.european_coverage.title':'Europäische Abdeckung',
  'feature.european_coverage.desc': 'Tätig in über 30 Euro-Ländern mit Mehrwährungskonten, automatischer Konvertierung und integrierter PSD2-Konformität.',
  'feature.enterprise_security.title': 'Enterprise-Sicherheit',
  'feature.enterprise_security.desc':  'Starke Authentifizierung, Echtzeit-Betrugserkennung und Zero-Trust-Architektur gemäß EBA-Richtlinien.',
  'feature.api.title': 'API & Integrationen',
  'feature.api.desc':  'Dokumentierte REST-APIs, Webhooks und native Konnektoren für SAP, Oracle, Salesforce und führende ERP-Systeme.',
  'feature.analytics.title': 'Erweiterte Analytik',
  'feature.analytics.desc':  'Echtzeit-Dashboard mit Cashflow-Prognosen, automatischer Abstimmung und steuerlichen Berichten.',

  /* ── How it works ── */
  'how.label':    'So funktioniert es',
  'how.headline': 'In wenigen Minuten einsatzbereit',

  'how.step1.title': 'Konto eröffnen',
  'how.step1.desc':  'Digitale Registrierung in unter 10 Minuten. Online-KYC ohne Filialtermin.',
  'how.step2.title': 'Unternehmen verbinden',
  'how.step2.desc':  'Importieren Sie Ihren Kontenplan, verbinden Sie Ihr ERP und laden Sie Ihr Team mit granularen Rollen ein.',
  'how.step3.title': 'Zahlungen starten',
  'how.step3.desc':  'Zahlungen auslösen, Ausgaben genehmigen und Cashflow von einer Plattform aus überwachen.',

  /* ── Security ── */
  'security.label':    'Sicherheit',
  'security.headline': 'Bankensichere Sicherheit',
  'security.desc':     "Jede Transaktion ist durch Ende-zu-Ende-Verschlüsselung, Zwei-Faktor-Authentifizierung und Echtzeit-Betrugserkennung geschützt. EBA- und Banca d'Italia-Konformität garantiert.",

  /* ── CTA Section ── */
  'cta.headline1': 'Bereit, Ihre Zahlungen',
  'cta.headline2': 'zu modernisieren?',
  'cta.sub':       'Schließen Sie sich Hunderten italienischer Unternehmen an, die DeePay bereits für ihr Cash-Management nutzen.',
  'cta.primary':   'Kostenloses Konto eröffnen',
  'cta.secondary': 'Mit Experten sprechen',

  /* ── Footer ── */
  'footer.tagline':          'Die Plattform für Geschäftszahlungen in Italien und Europa.',
  'footer.col.product':      'Produkt',
  'footer.col.company':      'Unternehmen',
  'footer.col.support':      'Support',
  'footer.product.features': 'Funktionen',
  'footer.product.pricing':  'Preise',
  'footer.product.security': 'Sicherheit',
  'footer.product.api':      'API',
  'footer.company.about':    'Über uns',
  'footer.company.blog':     'Blog',
  'footer.company.careers':  'Karriere',
  'footer.company.contact':  'Kontakt',
  'footer.support.help':     'Hilfecenter',
  'footer.support.status':   'Dienststatus',
  'footer.support.developers': 'Entwickler',
  'footer.support.terms':    'AGB & Datenschutz',
  'footer.copyright':        '© {{year}} DeePay S.r.l. — Alle Rechte vorbehalten',
  'footer.status':           'Dienste in Betrieb',

  /* ── App tabs ── */
  'tab.home':     'Start',
  'tab.wallet':   'Wallet',
  'tab.transfer': 'Überweisung',
  'tab.iban':     'IBAN',
  'tab.activity': 'Aktivität',
  'tab.points':   'Punkte',

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
  'Discover':     'Entdecken',
  'Pricing plan': 'Preispläne',
  'Login':        'Anmelden',
  'Sign up':      'Registrieren',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'Nehmen Sie die Kontrolle über Ihr Geld',
  'Current account':            'Girokonto',
  'VISA card':                  'VISA-Karte',
  'Crypto wallet':              'Krypto-Wallet',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': 'Schließen Sie sich Hunderttausenden von Nutzern an',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'Vergessen Sie Ihre traditionelle Bank',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay bietet: IBAN, Karten, Sofortüberweisungen, Fiat- und Krypto-Tausch — alles kostenlos, ohne Bankgebühren.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card':  'Heben Sie sich mit einer einzigartigen Debitkarte ab!',
  'Pay worldwide, bind Alipay & WeChat': 'Weltweit bezahlen',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'Krypto ohne Limits einzahlen',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'Krypto ohne Einschränkungen ein- und auszahlen. Jederzeit in EUR oder andere Kryptowährungen umtauschen.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'Ihre Sicherheit ist unsere Priorität',
  '24/7 AI support with human agents available when you need them':
    '24/7 KI-Support mit menschlichen Agenten, wenn Sie sie brauchen',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': 'Die digitale Finanz-App für alle.',

  /* ── Landing page footer columns ── */
  'Company':     'Unternehmen',
  'Home':        'Start',
  'About':       'Über uns',
  'Press':       'Presse',
  'Career':      'Karriere',
  'Ambassadors': 'Botschafter',
  'Verify':      'Verifizieren',
  'Status':      'Status',
  'Product':     'Produkt',
  'Features':    'Funktionen',
  'Business':    'Business',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market':   'Krypto-Markt',
  'Exchange':    'Tausch',
  'Suggestions': 'Vorschläge',
  'Help':        'Hilfe',
  'Contact':     'Kontakt',
  'Twitter':     'Twitter',
  'FAQ':         'FAQ',
  'Legal & Compliance': 'Recht & Compliance',
  'Legal Agreements':   'Rechtsvereinbarungen',
  'Website terms':      'Nutzungsbedingungen',
  'Privacy':            'Datenschutz',
  'All rights reserved.': 'Alle Rechte vorbehalten.',
  'Services operational': 'Dienste in Betrieb',
};

export default de;
