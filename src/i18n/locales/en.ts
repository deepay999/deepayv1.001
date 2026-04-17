/**
 * English fallback translations.
 * Used when the backend /api/language/en endpoint is unavailable.
 */
const en: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   'Product',
  'nav.security':  'Security',
  'nav.pricing':   'Pricing',
  'nav.blog':      'Blog',
  'nav.login':     'Sign in',
  'nav.register':  'Open free account',
  'nav.openMenu':  'Open menu',

  /* ── Hero ── */
  'hero.badge':       "PSD2 Compliant · Regulated by Banca d'Italia",
  'hero.headline1':   'The future of',
  'hero.headline2':   'business payments',
  'hero.headline3':   '',
  'hero.sub':         'DeePay is the financial platform built for Italian and European businesses. Instant transfers, corporate cards and collections — in one solution.',
  'hero.cta_primary': 'Get started free',
  'hero.cta_secondary': 'Discover the product',

  /* ── Trust badges ── */
  'trust.psd2':    'PSD2 Compliant',
  'trust.gdpr':    'GDPR Ready',
  'trust.iso':     'ISO 27001',
  'trust.soc2':    'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label': 'Annual payment volume',
  'kpi.countries_label': 'European countries covered',
  'kpi.auth_label': 'Avg. authorisation time',

  /* ── Features ── */
  'features.label': 'Features',
  'features.headline': 'Everything you need,',
  'features.headline_muted': 'without compromise',
  'features.sub': 'A complete platform designed for the needs of SMEs and large Italian companies.',

  'feature.instant_payments.title': 'Instant Payments',
  'feature.instant_payments.desc': 'Real-time SEPA transfers and international payments processed in seconds, 24/7 — including weekends and public holidays.',
  'feature.corporate_cards.title': 'Corporate Cards',
  'feature.corporate_cards.desc': 'Issue physical and virtual cards for every employee with custom limits, spending categories and automatic reconciliation.',
  'feature.european_coverage.title': 'European Coverage',
  'feature.european_coverage.desc': 'Operate in 30+ Euro-area countries with multi-currency accounts, automatic conversion and built-in PSD2 compliance.',
  'feature.enterprise_security.title': 'Enterprise Security',
  'feature.enterprise_security.desc': 'Strong authentication, real-time anti-fraud monitoring and zero-trust architecture compliant with EBA directives.',
  'feature.api.title': 'API & Integrations',
  'feature.api.desc': 'Documented REST APIs, webhooks and native connectors for SAP, Oracle, Salesforce and major ERPs.',
  'feature.analytics.title': 'Advanced Analytics',
  'feature.analytics.desc': 'Real-time dashboard with cash-flow forecasts, automatic reconciliation and reports ready for tax reporting.',

  /* ── How it works ── */
  'how.label': 'How it works',
  'how.headline': 'Up and running in minutes',

  'how.step1.title': 'Open an account',
  'how.step1.desc': 'Digital registration in under 10 minutes. Online KYC with no branch appointments needed.',
  'how.step2.title': 'Connect your company',
  'how.step2.desc': 'Import your chart of accounts, connect your ERP and invite your team with granular roles.',
  'how.step3.title': 'Start paying',
  'how.step3.desc': 'Issue payments, approve expenses and monitor cash-flow from a single platform.',

  /* ── Security ── */
  'security.label': 'Security',
  'security.headline': 'Bank-grade security',
  'security.desc': "Every transaction is protected by end-to-end encryption, two-factor authentication and real-time anti-fraud monitoring. EBA and Banca d'Italia compliance guaranteed.",

  /* ── CTA Section ── */
  'cta.headline1': 'Ready to modernise',
  'cta.headline2': 'your payments?',
  'cta.sub': 'Join hundreds of Italian companies that have already chosen DeePay to manage their cash flows.',
  'cta.primary': 'Open free account',
  'cta.secondary': 'Talk to an expert',

  /* ── Footer ── */
  'footer.tagline': 'The business payments platform for Italy and Europe.',
  'footer.col.product': 'Product',
  'footer.col.company': 'Company',
  'footer.col.support': 'Support',
  'footer.product.features': 'Features',
  'footer.product.pricing': 'Pricing',
  'footer.product.security': 'Security',
  'footer.product.api': 'API',
  'footer.company.about': 'About us',
  'footer.company.blog': 'Blog',
  'footer.company.careers': 'Careers',
  'footer.company.contact': 'Contact',
  'footer.support.help': 'Help Center',
  'footer.support.status': 'Status',
  'footer.support.developers': 'Developers',
  'footer.support.terms': 'Terms & Privacy',
  'footer.copyright': '© {{year}} DeePay S.r.l. — All rights reserved',
  'footer.status': 'Services operational',

  /* ── App tabs ── */
  'tab.home':     'Home',
  'tab.wallet':   'Wallet',
  'tab.transfer': 'Transfer',
  'tab.cards':    'Cards',
  'tab.wallets':  'Wallets',
  'tab.iban':     'IBAN',
  'tab.activity': 'Activity',
  'tab.points':   'Points',

  /* ── Language dropdown ── */
  'lang.zh': '中文',
  'lang.en': 'English',

  /* ── Landing page nav ── */
  'Discover':        'Discover',
  'Pricing plan':    'Pricing plan',
  'Login':           'Login',
  'Sign up':         'Sign up',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'Take control of your money',
  'Current account':            'Current account',
  'VISA card':                  'VISA card',
  'Crypto wallet':              'Crypto wallet',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': 'Join hundreds of thousands of users',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'Forget your bank account',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card': 'Stand out with a unique debit card!',
  'Pay worldwide, bind Alipay & WeChat': 'Pay worldwide, connect Alipay & WeChat',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'Deposit your crypto with no limits',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'We keep you protected',
  '24/7 AI support with human agents available when you need them':
    '24/7 AI support with human agents available when you need them',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': 'The digital finance app for everyone.',

  /* ── Landing page footer columns ── */
  'Company':     'Company',
  'Home':        'Home',
  'About':       'About',
  'Press':       'Press',
  'Career':      'Career',
  'Ambassadors': 'Ambassadors',
  'Verify':      'Verify',
  'Status':      'Status',
  'Product':     'Product',
  'Features':    'Features',
  'Business':    'Business',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market':   'Crypto Market',
  'Exchange':    'Exchange',
  'Suggestions': 'Suggestions',
  'Help':        'Help',
  'Contact':     'Contact',
  'Twitter':     'Twitter',
  'FAQ':         'FAQ',
  'Legal & Compliance': 'Legal & Compliance',
  'Legal Agreements':   'Legal Agreements',
  'Website terms':      'Website terms',
  'Privacy':            'Privacy',
  'All rights reserved.': 'All rights reserved.',
  'Services operational': 'Services operational',
};

export default en;
