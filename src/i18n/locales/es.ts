/**
 * Spanish fallback translations.
 * Usado cuando el endpoint backend /api/language/es no está disponible.
 */
const es: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   'Producto',
  'nav.security':  'Seguridad',
  'nav.pricing':   'Precios',
  'nav.blog':      'Blog',
  'nav.login':     'Iniciar sesión',
  'nav.register':  'Abrir cuenta gratuita',
  'nav.openMenu':  'Abrir menú',

  /* ── Hero ── */
  'hero.badge':         "Cumple PSD2 · Autorizado por el Banca d'Italia",
  'hero.headline1':     'El futuro de los',
  'hero.headline2':     'pagos empresariales',
  'hero.headline3':     '',
  'hero.sub':           'DeePay es la plataforma financiera creada para empresas italianas y europeas. Transferencias instantáneas, tarjetas corporativas y cobros — en una sola solución.',
  'hero.cta_primary':   'Comenzar gratis',
  'hero.cta_secondary': 'Descubrir el producto',

  /* ── Trust badges ── */
  'trust.psd2': 'Cumple PSD2',
  'trust.gdpr': 'RGPD Listo',
  'trust.iso':  'ISO 27001',
  'trust.soc2': 'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label':    'Volumen anual de pagos',
  'kpi.countries_label': 'Países europeos cubiertos',
  'kpi.auth_label':      'Tiempo medio de autorización',

  /* ── Features ── */
  'features.label':          'Características',
  'features.headline':       'Todo lo que necesitas,',
  'features.headline_muted': 'sin compromisos',
  'features.sub':            'Una plataforma completa diseñada para las necesidades de las pymes y grandes empresas italianas.',

  'feature.instant_payments.title': 'Pagos Instantáneos',
  'feature.instant_payments.desc':  'Transferencias SEPA en tiempo real y pagos internacionales procesados en segundos, 24/7 — incluidos fines de semana y festivos.',
  'feature.corporate_cards.title':  'Tarjetas Corporativas',
  'feature.corporate_cards.desc':   'Emite tarjetas físicas y virtuales para cada empleado con límites personalizados, categorías de gasto y conciliación automática.',
  'feature.european_coverage.title':'Cobertura Europea',
  'feature.european_coverage.desc': 'Opera en más de 30 países de la zona euro con cuentas multidivisa, conversión automática y cumplimiento PSD2 integrado.',
  'feature.enterprise_security.title': 'Seguridad Enterprise',
  'feature.enterprise_security.desc':  'Autenticación fuerte, monitoreo antifraude en tiempo real y arquitectura zero-trust conforme a las directivas EBA.',
  'feature.api.title': 'API & Integraciones',
  'feature.api.desc':  'API REST documentadas, webhooks y conectores nativos para SAP, Oracle, Salesforce y los principales ERP.',
  'feature.analytics.title': 'Analítica Avanzada',
  'feature.analytics.desc':  'Panel en tiempo real con previsiones de flujo de caja, conciliación automática e informes listos para la declaración fiscal.',

  /* ── How it works ── */
  'how.label':    'Cómo funciona',
  'how.headline': 'Operativo en minutos',

  'how.step1.title': 'Abre una cuenta',
  'how.step1.desc':  'Registro digital en menos de 10 minutos. KYC online sin citas en sucursal.',
  'how.step2.title': 'Conecta tu empresa',
  'how.step2.desc':  'Importa tu plan de cuentas, conecta tu ERP e invita a tu equipo con roles granulares.',
  'how.step3.title': 'Empieza a pagar',
  'how.step3.desc':  'Emite pagos, aprueba gastos y monitoriza el flujo de caja desde una sola plataforma.',

  /* ── Security ── */
  'security.label':    'Seguridad',
  'security.headline': 'Seguridad de nivel bancario',
  'security.desc':     "Cada transacción está protegida por cifrado de extremo a extremo, autenticación de dos factores y monitoreo antifraude en tiempo real. Cumplimiento EBA y Banca d'Italia garantizado.",

  /* ── CTA Section ── */
  'cta.headline1': 'Listo para modernizar',
  'cta.headline2': '¿tus pagos?',
  'cta.sub':       'Únete a cientos de empresas italianas que ya han elegido DeePay para gestionar sus flujos de caja.',
  'cta.primary':   'Abrir cuenta gratuita',
  'cta.secondary': 'Hablar con un experto',

  /* ── Footer ── */
  'footer.tagline':          'La plataforma de pagos empresariales para Italia y Europa.',
  'footer.col.product':      'Producto',
  'footer.col.company':      'Empresa',
  'footer.col.support':      'Soporte',
  'footer.product.features': 'Características',
  'footer.product.pricing':  'Precios',
  'footer.product.security': 'Seguridad',
  'footer.product.api':      'API',
  'footer.company.about':    'Quiénes somos',
  'footer.company.blog':     'Blog',
  'footer.company.careers':  'Empleo',
  'footer.company.contact':  'Contacto',
  'footer.support.help':     'Centro de ayuda',
  'footer.support.status':   'Estado del servicio',
  'footer.support.developers': 'Desarrolladores',
  'footer.support.terms':    'Términos & Privacidad',
  'footer.copyright':        '© {{year}} DeePay S.r.l. — Todos los derechos reservados',
  'footer.status':           'Servicios operativos',

  /* ── App tabs ── */
  'tab.home':     'Inicio',
  'tab.wallet':   'Cartera',
  'tab.transfer': 'Transferencia',
  'tab.iban':     'IBAN',
  'tab.activity': 'Actividad',
  'tab.points':   'Puntos',

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
  'Discover':     'Descubrir',
  'Pricing plan': 'Planes de precios',
  'Login':        'Iniciar sesión',
  'Sign up':      'Registrarse',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'Toma el control de tu dinero',
  'Current account':            'Cuenta corriente',
  'VISA card':                  'Tarjeta VISA',
  'Crypto wallet':              'Cartera cripto',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': 'Únete a cientos de miles de usuarios',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'Olvida tu banco tradicional',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay ofrece: IBAN, tarjetas, transferencias instantáneas, cambio fiat y cripto — todo gratis, sin comisiones bancarias.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card':  '¡Destaca con una tarjeta de débito única!',
  'Pay worldwide, bind Alipay & WeChat': 'Paga en todo el mundo',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'Deposita tus criptos sin límites',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'Deposita y retira criptos sin ninguna restricción. Convierte a EUR u otras criptos en cualquier momento.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'Tu seguridad es nuestra prioridad',
  '24/7 AI support with human agents available when you need them':
    'Soporte IA 24/7 con agentes humanos disponibles cuando los necesites',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': 'La app de finanzas digitales para todos.',

  /* ── Landing page footer columns ── */
  'Company':     'Empresa',
  'Home':        'Inicio',
  'About':       'Quiénes somos',
  'Press':       'Prensa',
  'Career':      'Carrera',
  'Ambassadors': 'Embajadores',
  'Verify':      'Verificar',
  'Status':      'Estado',
  'Product':     'Producto',
  'Features':    'Características',
  'Business':    'Business',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market':   'Mercado Cripto',
  'Exchange':    'Cambio',
  'Suggestions': 'Sugerencias',
  'Help':        'Ayuda',
  'Contact':     'Contacto',
  'Twitter':     'Twitter',
  'FAQ':         'FAQ',
  'Legal & Compliance': 'Legal y Cumplimiento',
  'Legal Agreements':   'Acuerdos legales',
  'Website terms':      'Términos del sitio',
  'Privacy':            'Privacidad',
  'All rights reserved.': 'Todos los derechos reservados.',
  'Services operational': 'Servicios operativos',
};

export default es;
