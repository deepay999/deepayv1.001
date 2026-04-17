/**
 * French fallback translations.
 * Utilisé quand l'endpoint backend /api/language/fr est indisponible.
 */
const fr: Record<string, string> = {
  /* ── Nav ── */
  'nav.product': 'Produit',
  'nav.security': 'Sécurité',
  'nav.pricing': 'Tarifs',
  'nav.blog': 'Blog',
  'nav.login': 'Se connecter',
  'nav.register': 'Ouvrir un compte gratuit',
  'nav.openMenu': 'Ouvrir le menu',

  /* ── Hero ── */
  'hero.badge': "Conforme PSD2 · Agréé par la Banca d'Italia",
  'hero.headline1': "L'avenir des",
  'hero.headline2': 'paiements professionnels',
  'hero.headline3': '',
  'hero.sub': "DeePay est la plateforme financière conçue pour les entreprises italiennes et européennes. Virements instantanés, cartes d'entreprise et encaissements — en une seule solution.",
  'hero.cta_primary': 'Commencer gratuitement',
  'hero.cta_secondary': 'Découvrir le produit',

  /* ── Trust badges ── */
  'trust.psd2': 'Conforme PSD2',
  'trust.gdpr': 'RGPD Ready',
  'trust.iso': 'ISO 27001',
  'trust.soc2': 'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label': 'Volume annuel de paiements',
  'kpi.countries_label': 'Pays européens couverts',
  'kpi.auth_label': "Temps d'autorisation moyen",

  /* ── Features ── */
  'features.label': 'Fonctionnalités',
  'features.headline': 'Tout ce dont vous avez besoin,',
  'features.headline_muted': 'sans compromis',
  'features.sub': "Une plateforme complète conçue pour les besoins des PME et des grandes entreprises italiennes.",

  'feature.instant_payments.title': 'Paiements Instantanés',
  'feature.instant_payments.desc': 'Virements SEPA en temps réel et paiements internationaux traités en quelques secondes, 24h/24 — week-ends et jours fériés inclus.',
  'feature.corporate_cards.title': "Cartes d'Entreprise",
  'feature.corporate_cards.desc': 'Émettez des cartes physiques et virtuelles pour chaque employé avec des limites personnalisées, des catégories de dépenses et un rapprochement automatique.',
  'feature.european_coverage.title': 'Couverture Européenne',
  'feature.european_coverage.desc': "Opérez dans plus de 30 pays de la zone euro avec des comptes multidevises, conversion automatique et conformité PSD2 intégrée.",
  'feature.enterprise_security.title': 'Sécurité Entreprise',
  'feature.enterprise_security.desc': "Authentification forte, surveillance antifraude en temps réel et architecture zéro-confiance conforme aux directives EBA.",
  'feature.api.title': 'API & Intégrations',
  'feature.api.desc': 'API REST documentées, webhooks et connecteurs natifs pour SAP, Oracle, Salesforce et les principaux ERP.',
  'feature.analytics.title': 'Analytiques Avancées',
  'feature.analytics.desc': 'Tableau de bord en temps réel avec prévisions de trésorerie, rapprochement automatique et rapports prêts pour la déclaration fiscale.',

  /* ── How it works ── */
  'how.label': 'Comment ça marche',
  'how.headline': 'Opérationnel en quelques minutes',

  'how.step1.title': 'Ouvrez un compte',
  'how.step1.desc': 'Inscription numérique en moins de 10 minutes. KYC en ligne sans rendez-vous en agence.',
  'how.step2.title': 'Connectez votre entreprise',
  'how.step2.desc': "Importez votre plan comptable, connectez votre ERP et invitez votre équipe avec des rôles granulaires.",
  'how.step3.title': 'Commencez à payer',
  'how.step3.desc': 'Émettez des paiements, approuvez les dépenses et surveillez la trésorerie depuis une seule plateforme.',

  /* ── Security ── */
  'security.label': 'Sécurité',
  'security.headline': 'Sécurité de niveau bancaire',
  'security.desc': "Chaque transaction est protégée par un chiffrement de bout en bout, une authentification à deux facteurs et une surveillance antifraude en temps réel. Conformité EBA et Banca d'Italia garantie.",

  /* ── CTA Section ── */
  'cta.headline1': 'Prêt à moderniser',
  'cta.headline2': 'vos paiements ?',
  'cta.sub': "Rejoignez des centaines d'entreprises italiennes qui ont déjà choisi DeePay pour gérer leurs flux de trésorerie.",
  'cta.primary': 'Ouvrir un compte gratuit',
  'cta.secondary': 'Parler à un expert',

  /* ── Footer ── */
  'footer.tagline': "La plateforme de paiements professionnels pour l'Italie et l'Europe.",
  'footer.col.product': 'Produit',
  'footer.col.company': 'Entreprise',
  'footer.col.support': 'Support',
  'footer.product.features': 'Fonctionnalités',
  'footer.product.pricing': 'Tarifs',
  'footer.product.security': 'Sécurité',
  'footer.product.api': 'API',
  'footer.company.about': 'À propos',
  'footer.company.blog': 'Blog',
  'footer.company.careers': 'Carrières',
  'footer.company.contact': 'Contact',
  'footer.support.help': "Centre d'aide",
  'footer.support.status': 'État des services',
  'footer.support.developers': 'Développeurs',
  'footer.support.terms': 'Conditions & Confidentialité',
  'footer.copyright': '© {{year}} DeePay S.r.l. — Tous droits réservés',
  'footer.status': 'Services opérationnels',

  /* ── App tabs ── */
  'tab.home': 'Accueil',
  'tab.wallet': 'Portefeuille',
  'tab.transfer': 'Virement',
  'tab.iban': 'IBAN',
  'tab.activity': 'Activité',
  'tab.points': 'Points',

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
  'Discover': 'Découvrir',
  'Pricing plan': 'Plans tarifaires',
  'Login': 'Connexion',
  'Sign up': "S'inscrire",

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'Prenez le contrôle de votre argent',
  'Current account': 'Compte courant',
  'VISA card': 'Carte VISA',
  'Crypto wallet': 'Portefeuille crypto',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': "Rejoignez des centaines de milliers d'utilisateurs",

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'Oubliez votre banque traditionnelle',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay offre : IBAN, cartes, virements instantanés, change fiat & crypto — tout gratuit, sans frais bancaires.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card': 'Démarquez-vous avec une carte de débit unique !',
  'Pay worldwide, bind Alipay & WeChat': 'Payez partout dans le monde',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'Déposez vos cryptos sans limites',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'Déposez et retirez des cryptos sans aucune restriction. Convertissez en EUR ou autres cryptos à tout moment.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'Votre sécurité est notre priorité',
  '24/7 AI support with human agents available when you need them':
    'Support IA 24/7 avec des agents humains disponibles quand vous en avez besoin',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': "L'application de finance digitale pour tous.",

  /* ── Landing page footer columns ── */
  'Company': 'Entreprise',
  'Home': 'Accueil',
  'About': 'À propos',
  'Press': 'Presse',
  'Career': 'Carrière',
  'Ambassadors': 'Ambassadeurs',
  'Verify': 'Vérifier',
  'Status': 'État',
  'Product': 'Produit',
  'Features': 'Fonctionnalités',
  'Business': 'Business',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market': 'Marché Crypto',
  'Exchange': 'Change',
  'Suggestions': 'Suggestions',
  'Help': 'Aide',
  'Contact': 'Contact',
  'Twitter': 'Twitter',
  'FAQ': 'FAQ',
  'Legal & Compliance': 'Juridique & Conformité',
  'Legal Agreements': 'Accords juridiques',
  'Website terms': 'CGU',
  'Privacy': 'Confidentialité',
  'All rights reserved.': 'Tous droits réservés.',
  'Services operational': 'Services opérationnels',
};

export default fr;
