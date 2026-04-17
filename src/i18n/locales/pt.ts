/**
 * Portuguese fallback translations.
 * Usado quando o endpoint backend /api/language/pt não está disponível.
 */
const pt: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   'Produto',
  'nav.security':  'Segurança',
  'nav.pricing':   'Preços',
  'nav.blog':      'Blog',
  'nav.login':     'Entrar',
  'nav.register':  'Abrir conta gratuita',
  'nav.openMenu':  'Abrir menu',

  /* ── Hero ── */
  'hero.badge':         "Conforme PSD2 · Autorizado pelo Banca d'Italia",
  'hero.headline1':     'O futuro dos',
  'hero.headline2':     'pagamentos empresariais',
  'hero.headline3':     '',
  'hero.sub':           'DeePay é a plataforma financeira criada para empresas italianas e europeias. Transferências instantâneas, cartões corporativos e cobranças — numa única solução.',
  'hero.cta_primary':   'Começar gratuitamente',
  'hero.cta_secondary': 'Descobrir o produto',

  /* ── Trust badges ── */
  'trust.psd2': 'Conforme PSD2',
  'trust.gdpr': 'RGPD Pronto',
  'trust.iso':  'ISO 27001',
  'trust.soc2': 'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label':    'Volume anual de pagamentos',
  'kpi.countries_label': 'Países europeus cobertos',
  'kpi.auth_label':      'Tempo médio de autorização',

  /* ── Features ── */
  'features.label':          'Funcionalidades',
  'features.headline':       'Tudo o que precisa,',
  'features.headline_muted': 'sem compromissos',
  'features.sub':            'Uma plataforma completa projetada para as necessidades de PMEs e grandes empresas italianas.',

  'feature.instant_payments.title': 'Pagamentos Instantâneos',
  'feature.instant_payments.desc':  'Transferências SEPA em tempo real e pagamentos internacionais processados em segundos, 24/7 — incluindo fins de semana e feriados.',
  'feature.corporate_cards.title':  'Cartões Corporativos',
  'feature.corporate_cards.desc':   'Emita cartões físicos e virtuais para cada funcionário com limites personalizados, categorias de despesas e reconciliação automática.',
  'feature.european_coverage.title':'Cobertura Europeia',
  'feature.european_coverage.desc': 'Opere em mais de 30 países da zona euro com contas multidivisa, conversão automática e conformidade PSD2 integrada.',
  'feature.enterprise_security.title': 'Segurança Enterprise',
  'feature.enterprise_security.desc':  'Autenticação forte, monitoramento antifraude em tempo real e arquitetura zero-trust conforme às diretivas EBA.',
  'feature.api.title': 'API & Integrações',
  'feature.api.desc':  'APIs REST documentadas, webhooks e conectores nativos para SAP, Oracle, Salesforce e principais ERPs.',
  'feature.analytics.title': 'Análise Avançada',
  'feature.analytics.desc':  'Painel em tempo real com previsões de fluxo de caixa, reconciliação automática e relatórios prontos para declaração fiscal.',

  /* ── How it works ── */
  'how.label':    'Como funciona',
  'how.headline': 'Operacional em minutos',

  'how.step1.title': 'Abra uma conta',
  'how.step1.desc':  'Registo digital em menos de 10 minutos. KYC online sem deslocações à agência.',
  'how.step2.title': 'Conecte a sua empresa',
  'how.step2.desc':  'Importe o seu plano de contas, conecte o seu ERP e convide a equipa com papéis granulares.',
  'how.step3.title': 'Comece a pagar',
  'how.step3.desc':  'Emita pagamentos, aprove despesas e monitorize o fluxo de caixa a partir de uma única plataforma.',

  /* ── Security ── */
  'security.label':    'Segurança',
  'security.headline': 'Segurança de nível bancário',
  'security.desc':     "Cada transação é protegida por encriptação de ponta a ponta, autenticação de dois fatores e monitoramento antifraude em tempo real. Conformidade EBA e Banca d'Italia garantida.",

  /* ── CTA Section ── */
  'cta.headline1': 'Pronto para modernizar',
  'cta.headline2': 'os seus pagamentos?',
  'cta.sub':       'Junte-se a centenas de empresas italianas que já escolheram a DeePay para gerir os seus fluxos de caixa.',
  'cta.primary':   'Abrir conta gratuita',
  'cta.secondary': 'Falar com um especialista',

  /* ── Footer ── */
  'footer.tagline':          'A plataforma de pagamentos empresariais para Itália e Europa.',
  'footer.col.product':      'Produto',
  'footer.col.company':      'Empresa',
  'footer.col.support':      'Suporte',
  'footer.product.features': 'Funcionalidades',
  'footer.product.pricing':  'Preços',
  'footer.product.security': 'Segurança',
  'footer.product.api':      'API',
  'footer.company.about':    'Sobre nós',
  'footer.company.blog':     'Blog',
  'footer.company.careers':  'Carreiras',
  'footer.company.contact':  'Contacto',
  'footer.support.help':     'Centro de ajuda',
  'footer.support.status':   'Estado do serviço',
  'footer.support.developers': 'Programadores',
  'footer.support.terms':    'Termos & Privacidade',
  'footer.copyright':        '© {{year}} DeePay S.r.l. — Todos os direitos reservados',
  'footer.status':           'Serviços operacionais',

  /* ── App tabs ── */
  'tab.home':     'Início',
  'tab.wallet':   'Carteira',
  'tab.transfer': 'Transferência',
  'tab.iban':     'IBAN',
  'tab.activity': 'Atividade',
  'tab.points':   'Pontos',

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
  'Discover':     'Descobrir',
  'Pricing plan': 'Planos de preços',
  'Login':        'Entrar',
  'Sign up':      'Registar',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'Assuma o controlo do seu dinheiro',
  'Current account':            'Conta à ordem',
  'VISA card':                  'Cartão VISA',
  'Crypto wallet':              'Carteira cripto',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': 'Junte-se a centenas de milhares de utilizadores',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'Esqueça o seu banco tradicional',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay oferece: IBAN, cartões, transferências instantâneas, câmbio fiat e cripto — tudo gratuito, sem taxas bancárias.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card':  'Destaque-se com um cartão de débito único!',
  'Pay worldwide, bind Alipay & WeChat': 'Pague em todo o mundo',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'Deposite as suas criptos sem limites',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'Deposite e levante criptos sem quaisquer restrições. Converta para EUR ou outras criptos a qualquer momento.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'A sua segurança é a nossa prioridade',
  '24/7 AI support with human agents available when you need them':
    'Suporte IA 24/7 com agentes humanos disponíveis quando precisar',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': 'A app de finanças digitais para todos.',

  /* ── Landing page footer columns ── */
  'Company':     'Empresa',
  'Home':        'Início',
  'About':       'Sobre nós',
  'Press':       'Imprensa',
  'Career':      'Carreira',
  'Ambassadors': 'Embaixadores',
  'Verify':      'Verificar',
  'Status':      'Estado',
  'Product':     'Produto',
  'Features':    'Funcionalidades',
  'Business':    'Business',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market':   'Mercado Cripto',
  'Exchange':    'Câmbio',
  'Suggestions': 'Sugestões',
  'Help':        'Ajuda',
  'Contact':     'Contacto',
  'Twitter':     'Twitter',
  'FAQ':         'FAQ',
  'Legal & Compliance': 'Legal e Conformidade',
  'Legal Agreements':   'Acordos legais',
  'Website terms':      'Termos do site',
  'Privacy':            'Privacidade',
  'All rights reserved.': 'Todos os direitos reservados.',
  'Services operational': 'Serviços operacionais',
};

export default pt;
