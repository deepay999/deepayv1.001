/**
 * Chinese (Simplified) fallback translations.
 * Used when the backend /api/language/zh endpoint is unavailable.
 */
const zh: Record<string, string> = {
  /* ── Nav ── */
  'nav.product':   '产品',
  'nav.security':  '安全',
  'nav.pricing':   '价格',
  'nav.blog':      '博客',
  'nav.login':     '登录',
  'nav.register':  '开立免费账户',
  'nav.openMenu':  '打开菜单',

  /* ── Hero ── */
  'hero.badge':       'PSD2 合规 · 意大利央行监管',
  'hero.headline1':   '企业支付的',
  'hero.headline2':   '未来',
  'hero.headline3':   '',
  'hero.sub':         'DeePay 是专为意大利及欧洲企业打造的金融平台。即时转账、企业卡和收款——一站式解决方案。',
  'hero.cta_primary': '免费开始',
  'hero.cta_secondary': '了解产品',

  /* ── Trust badges ── */
  'trust.psd2':    'PSD2 合规',
  'trust.gdpr':    'GDPR 就绪',
  'trust.iso':     'ISO 27001',
  'trust.soc2':    'SOC 2 Type II',

  /* ── KPI ── */
  'kpi.volume_label': '年支付量',
  'kpi.countries_label': '覆盖欧洲国家',
  'kpi.auth_label': '平均授权时间',

  /* ── Features ── */
  'features.label': '功能',
  'features.headline': '所需一切，',
  'features.headline_muted': '毫不妥协',
  'features.sub': '专为意大利及大型企业需求设计的完整平台。',

  'feature.instant_payments.title': '即时支付',
  'feature.instant_payments.desc': '实时 SEPA 转账和国际支付，几秒内完成处理，全天候 24/7——包括周六、周日和节假日。',
  'feature.corporate_cards.title': '企业卡',
  'feature.corporate_cards.desc': '为每位员工签发实体和虚拟卡，设置自定义限额、消费类别和自动对账。',
  'feature.european_coverage.title': '欧洲覆盖',
  'feature.european_coverage.desc': '在欧元区 30 多个国家运营，支持多币种账户、自动换汇和内置 PSD2 合规。',
  'feature.enterprise_security.title': '企业级安全',
  'feature.enterprise_security.desc': '强身份验证、实时反欺诈监控和符合 EBA 指令的零信任架构。',
  'feature.api.title': 'API 与集成',
  'feature.api.desc': '完整文档的 REST API、Webhook 和 SAP、Oracle、Salesforce 原生连接器。',
  'feature.analytics.title': '高级分析',
  'feature.analytics.desc': '实时仪表板，含现金流预测、自动对账和税务报告。',

  /* ── How it works ── */
  'how.label': '使用流程',
  'how.headline': '几分钟内上线运营',

  'how.step1.title': '开立账户',
  'how.step1.desc': '10 分钟内完成数字注册，无需到网点预约，在线 KYC。',
  'how.step2.title': '关联企业',
  'how.step2.desc': '导入会计科目表，连接 ERP，并以细粒度角色邀请团队。',
  'how.step3.title': '开始支付',
  'how.step3.desc': '从一个平台发起支付、审批费用并监控现金流。',

  /* ── Security ── */
  'security.label': '安全',
  'security.headline': '银行级安全',
  'security.desc': '每笔交易均受端到端加密、双因素认证和实时反欺诈监控保护。符合 EBA 和意大利央行要求。',

  /* ── CTA Section ── */
  'cta.headline1': '准备好升级',
  'cta.headline2': '您的支付方式了吗？',
  'cta.sub': '加入已选择 DeePay 管理现金流的数百家意大利企业。',
  'cta.primary': '开立免费账户',
  'cta.secondary': '咨询专家',

  /* ── Footer ── */
  'footer.tagline': '面向意大利和欧洲的企业支付平台。',
  'footer.col.product': '产品',
  'footer.col.company': '公司',
  'footer.col.support': '支持',
  'footer.product.features': '功能',
  'footer.product.pricing': '价格',
  'footer.product.security': '安全',
  'footer.product.api': 'API',
  'footer.company.about': '关于我们',
  'footer.company.blog': '博客',
  'footer.company.careers': '加入我们',
  'footer.company.contact': '联系我们',
  'footer.support.help': '帮助中心',
  'footer.support.status': '状态',
  'footer.support.developers': '开发者',
  'footer.support.terms': '条款与隐私',
  'footer.copyright': '© {{year}} DeePay S.r.l. — 版权所有',
  'footer.status': '服务运行中',

  /* ── App tabs ── */
  'tab.home':     '首页',
  'tab.wallet':   '钱包',
  'tab.transfer': '转账',
  'tab.iban':     'IBAN',
  'tab.activity': '活动',
  'tab.points':   '积分',

  /* ── Language dropdown ── */
  'lang.zh': '中文',
  'lang.en': 'English',

  /* ── Landing page nav ── */
  'Discover':        '探索',
  'Pricing plan':    '价格方案',
  'Login':           '登录',
  'Sign up':         '注册',

  /* ── Landing page hero (Section 1) ── */
  'Take control of your money': '掌控你的资金',
  'Current account':            '活期账户',
  'VISA card':                  'VISA卡',
  'Crypto wallet':              '加密货币钱包',

  /* ── Landing page Section 2 ── */
  'Join hundreds of thousands of users': '加入数十万用户的行列',

  /* ── Landing page Section 3 ── */
  'Forget your bank account': '忘记你的银行账户吧',
  'DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.':
    'DeePay提供：IBAN、银行卡、即时银行转账、货币和加密货币兑换……全部免费且不收取任何银行手续费！',

  /* ── Landing page Section 4 ── */
  'Stand out with a unique debit card': '使用独一无二的借记卡，彰显个性！',
  'Pay worldwide, bind Alipay & WeChat': '全球支付，绑定支付宝微信',

  /* ── Landing page Section 5 ── */
  'Deposit your crypto with no limits': '无限制地存入您的加密货币',
  'Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.':
    '存取加密货币不受任何限制或条件限制。可将其兑换成欧元或其他加密货币。',

  /* ── Landing page Section 6 ── */
  'We keep you protected': '我们为您提供保障',
  '24/7 AI support with human agents available when you need them':
    '24小时AI智能客服，人工客服为您服务',

  /* ── Landing page footer brand ── */
  'The digital finance app for everyone.': '面向所有人的数字金融应用。',

  /* ── Landing page footer columns ── */
  'Company':     '公司',
  'Home':        '首页',
  'About':       '关于我们',
  'Press':       '媒体',
  'Career':      '职业',
  'Ambassadors': '大使',
  'Verify':      '核实',
  'Status':      '状态',
  'Product':     '产品',
  'Features':    '功能特性',
  'Business':    '企业版',
  'Bursted Bubbles': '泡沫破裂',
  'Crypto Market':   '加密货币市场',
  'Exchange':    '兑换',
  'Suggestions': '建议',
  'Help':        '帮助',
  'Contact':     '联系我们',
  'Twitter':     'Twitter',
  'FAQ':         '常见问题',
  'Legal & Compliance': '法律与合规',
  'Legal Agreements':   '法律协议',
  'Website terms':      '网站条款',
  'Privacy':            '隐私政策',
  'All rights reserved.': '版权所有。',
  'Services operational': '服务正常运行',
};

export default zh;
