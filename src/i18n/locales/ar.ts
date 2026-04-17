/**
 * Arabic fallback translations — RTL language.
 * يُستخدم عندما لا تتوفر نقطة النهاية /api/language/ar في الخادم.
 */
const ar: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   'المنتج',
  'nav.security':  'الأمان',
  'nav.pricing':   'الأسعار',
  'nav.blog':      'المدونة',
  'nav.login':     'تسجيل الدخول',
  'nav.register':  'فتح حساب مجاني',
  'nav.openMenu':  'فتح القائمة',

  /* ── Hero ── */
  'hero.badge':         'متوافق مع PSD2 · مرخّص من Banca d\'Italia',
  'hero.headline1':     'مستقبل',
  'hero.headline2':     'المدفوعات التجارية',
  'hero.headline3':     '',
  'hero.sub':           'DeePay هي المنصة المالية المصممة للشركات الإيطالية والأوروبية. تحويلات فورية وبطاقات مؤسسية وتحصيل المبالغ — في حل واحد.',
  'hero.cta_primary':   'ابدأ مجاناً',
  'hero.cta_secondary': 'اكتشف المنتج',

  /* ── Trust badges ── */
  'trust.psd2': 'متوافق مع PSD2',
  'trust.gdpr': 'جاهز للامتثال GDPR',
  'trust.iso':  'ISO 27001',
  'trust.soc2': 'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label':    'حجم المدفوعات السنوي',
  'kpi.countries_label': 'الدول الأوروبية المشمولة',
  'kpi.auth_label':      'متوسط وقت التفويض',

  /* ── Features ── */
  'features.label':          'المميزات',
  'features.headline':       'كل ما تحتاجه،',
  'features.headline_muted': 'بدون تنازلات',
  'features.sub':            'منصة متكاملة مصممة لاحتياجات الشركات الصغيرة والمتوسطة والشركات الإيطالية الكبرى.',

  'feature.instant_payments.title': 'المدفوعات الفورية',
  'feature.instant_payments.desc':  'تحويلات SEPA فورية ومدفوعات دولية تُعالج في ثوانٍ، على مدار الساعة — بما في ذلك عطل نهاية الأسبوع والأعياد.',
  'feature.corporate_cards.title':  'البطاقات المؤسسية',
  'feature.corporate_cards.desc':   'أصدر بطاقات مادية وافتراضية لكل موظف مع حدود مخصصة وفئات إنفاق ومطابقة تلقائية.',
  'feature.european_coverage.title':'التغطية الأوروبية',
  'feature.european_coverage.desc': 'العمل في أكثر من 30 دولة في منطقة اليورو مع حسابات متعددة العملات وتحويل تلقائي وامتثال PSD2 مدمج.',
  'feature.enterprise_security.title': 'أمان على مستوى المؤسسات',
  'feature.enterprise_security.desc':  'مصادقة قوية ومراقبة احتيال في الوقت الفعلي وبنية Zero Trust متوافقة مع توجيهات EBA.',
  'feature.api.title': 'واجهات برمجية وتكاملات',
  'feature.api.desc':  'واجهات REST موثّقة وـ Webhooks وموصلات أصلية لـ SAP وOracle وSalesforce وكبرى أنظمة ERP.',
  'feature.analytics.title': 'تحليلات متقدمة',
  'feature.analytics.desc':  'لوحة تحكم في الوقت الفعلي مع توقعات التدفق النقدي والمطابقة التلقائية والتقارير الجاهزة للإقرار الضريبي.',

  /* ── How it works ── */
  'how.label':    'كيف يعمل',
  'how.headline': 'جاهز للعمل في دقائق',

  'how.step1.title': 'افتح حساباً',
  'how.step1.desc':  'تسجيل رقمي في أقل من 10 دقائق. KYC إلكتروني دون الحاجة لمواعيد في الفروع.',
  'how.step2.title': 'ربط شركتك',
  'how.step2.desc':  'استورد دليل حساباتك، اربط نظام ERP الخاص بك وادعُ فريقك بصلاحيات دقيقة.',
  'how.step3.title': 'ابدأ بالدفع',
  'how.step3.desc':  'أصدر مدفوعات واعتمد المصروفات وراقب التدفق النقدي من منصة واحدة.',

  /* ── Security ── */
  'security.label':    'الأمان',
  'security.headline': 'أمان بمستوى بنكي',
  'security.desc':     "كل معاملة محمية بتشفير كامل من طرف إلى طرف ومصادقة ثنائية ومراقبة احتيال في الوقت الفعلي. الامتثال لـ EBA وBanca d'Italia مضمون.",

  /* ── CTA Section ── */
  'cta.headline1': 'هل أنت مستعد لتحديث',
  'cta.headline2': 'مدفوعاتك؟',
  'cta.sub':       'انضم إلى مئات الشركات الإيطالية التي اختارت DeePay بالفعل لإدارة تدفقاتها النقدية.',
  'cta.primary':   'فتح حساب مجاني',
  'cta.secondary': 'التحدث مع خبير',

  /* ── Footer ── */
  'footer.tagline':          'منصة المدفوعات التجارية لإيطاليا وأوروبا.',
  'footer.col.product':      'المنتج',
  'footer.col.company':      'الشركة',
  'footer.col.support':      'الدعم',
  'footer.product.features': 'المميزات',
  'footer.product.pricing':  'الأسعار',
  'footer.product.security': 'الأمان',
  'footer.product.api':      'API',
  'footer.company.about':    'من نحن',
  'footer.company.blog':     'المدونة',
  'footer.company.careers':  'وظائف',
  'footer.company.contact':  'تواصل معنا',
  'footer.support.help':     'مركز المساعدة',
  'footer.support.status':   'حالة الخدمة',
  'footer.support.developers': 'المطورون',
  'footer.support.terms':    'الشروط والخصوصية',
  'footer.copyright':        '© {{year}} DeePay S.r.l. — جميع الحقوق محفوظة',
  'footer.status':           'الخدمات تعمل بشكل طبيعي',

  /* ── App tabs ── */
  'tab.home':     'الرئيسية',
  'tab.wallet':   'المحفظة',
  'tab.transfer': 'تحويل',
  'tab.iban':     'IBAN',
  'tab.activity': 'النشاط',
  'tab.points':   'النقاط',

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
  'Discover':     'اكتشف',
  'Pricing plan': 'خطط الأسعار',
  'Login':        'تسجيل الدخول',
  'Sign up':      'إنشاء حساب',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': 'تحكم في أموالك',
  'Current account':            'حساب جاري',
  'VISA card':                  'بطاقة VISA',
  'Crypto wallet':              'محفظة كريبتو',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': 'انضم إلى مئات الآلاف من المستخدمين',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': 'انسَ مصرفك التقليدي',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay توفر: IBAN، بطاقات، تحويلات فورية، صرف عملات ورقمية — كل ذلك مجاناً دون رسوم بنكية.',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card':  'تميّز ببطاقة خصم فريدة من نوعها!',
  'Pay worldwide, bind Alipay & WeChat': 'ادفع في كل أنحاء العالم',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': 'أودع عملاتك المشفرة بلا حدود',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    'أودع واسحب العملات المشفرة دون أي قيود. حوّلها إلى يورو أو عملات رقمية أخرى في أي وقت.',

  /* ── Landing page Section 6 ── */
  'We keep you protected': 'أمانك هو أولويتنا',
  '24/7 AI support with human agents available when you need them':
    'دعم ذكاء اصطناعي على مدار الساعة مع وكلاء بشريين متاحين عند الحاجة',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': 'تطبيق التمويل الرقمي للجميع.',

  /* ── Landing page footer columns ── */
  'Company':     'الشركة',
  'Home':        'الرئيسية',
  'About':       'من نحن',
  'Press':       'الصحافة',
  'Career':      'المهن',
  'Ambassadors': 'السفراء',
  'Verify':      'التحقق',
  'Status':      'الحالة',
  'Product':     'المنتج',
  'Features':    'المميزات',
  'Business':    'الأعمال',
  'Bursted Bubbles': 'Bursted Bubbles',
  'Crypto Market':   'سوق الكريبتو',
  'Exchange':    'الصرف',
  'Suggestions': 'الاقتراحات',
  'Help':        'المساعدة',
  'Contact':     'تواصل',
  'Twitter':     'Twitter',
  'FAQ':         'الأسئلة الشائعة',
  'Legal & Compliance': 'القانوني والامتثال',
  'Legal Agreements':   'الاتفاقيات القانونية',
  'Website terms':      'شروط الموقع',
  'Privacy':            'الخصوصية',
  'All rights reserved.': 'جميع الحقوق محفوظة.',
  'Services operational': 'الخدمات تعمل بشكل طبيعي',
};

export default ar;
