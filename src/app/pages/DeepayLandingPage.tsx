import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Building2,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { LanguageDropdown } from '../components/LanguageDropdown';

/* ─────────────────────────── helpers ─────────────────────── */

function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setValue(Math.round(current));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return value;
}

/* ─────────────────────────── data ────────────────────────── */

const FEATURE_DEFS = [
  { icon: Zap,       color: '#10B981', titleKey: 'feature.instant_payments.title', descKey: 'feature.instant_payments.desc' },
  { icon: CreditCard,color: '#3B82F6', titleKey: 'feature.corporate_cards.title',  descKey: 'feature.corporate_cards.desc'  },
  { icon: Globe,     color: '#8B5CF6', titleKey: 'feature.european_coverage.title',descKey: 'feature.european_coverage.desc'},
  { icon: Shield,    color: '#F59E0B', titleKey: 'feature.enterprise_security.title',descKey: 'feature.enterprise_security.desc'},
  { icon: Building2, color: '#EF4444', titleKey: 'feature.api.title',              descKey: 'feature.api.desc'              },
  { icon: TrendingUp,color: '#10B981', titleKey: 'feature.analytics.title',        descKey: 'feature.analytics.desc'        },
];

const HOW_IT_WORKS_DEFS = [
  { step: '01', titleKey: 'how.step1.title', descKey: 'how.step1.desc' },
  { step: '02', titleKey: 'how.step2.title', descKey: 'how.step2.desc' },
  { step: '03', titleKey: 'how.step3.title', descKey: 'how.step3.desc' },
];

const KPI_DATA = [
  { value: 2.4, suffix: 'Mld €', labelKey: 'kpi.volume_label',    icon: TrendingUp },
  { value: 30,  suffix: '+',     labelKey: 'kpi.countries_label',  icon: Globe      },
  { value: 0.7, suffix: 's',     labelKey: 'kpi.auth_label',       icon: Clock      },
];

/* ─────────────────────────── sub-components ──────────────── */

function KpiCard({
  kpi,
  index,
}: {
  kpi: (typeof KPI_DATA)[0];
  index: number;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useCountUp(kpi.value * 10, 1800, inView);
  const displayed =
    kpi.value % 1 === 0 ? count / 10 : (count / 10).toFixed(1);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center text-center py-10 px-6 group"
    >
      <kpi.icon className="w-6 h-6 text-emerald-400 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="font-['Outfit'] text-5xl font-bold text-white tracking-tight mb-2">
        {displayed}
        <span className="text-emerald-400 ml-1">{kpi.suffix}</span>
      </div>
      <p className="text-sm text-white/50 uppercase tracking-widest">{t(kpi.labelKey)}</p>
    </motion.div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURE_DEFS)[0];
  index: number;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = feature.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.06] transition-colors duration-300 cursor-default"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${feature.color}18` }}
      >
        <Icon className="w-5 h-5" style={{ color: feature.color }} />
      </div>
      <h3 className="font-['Outfit'] text-lg font-semibold text-white mb-2">{t(feature.titleKey)}</h3>
      <p className="text-sm leading-relaxed text-white/55">{t(feature.descKey)}</p>
    </motion.div>
  );
}

/* ─────────────────────────── how it works step ───────────── */

function HowItWorksStep({
  item,
  index,
}: {
  item: (typeof HOW_IT_WORKS_DEFS)[0];
  index: number;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.15 }}
      className="text-center md:text-left"
    >
      <div className="font-['Outfit'] text-6xl font-bold text-white/8 mb-6 select-none">
        {item.step}
      </div>
      <h3 className="font-['Outfit'] text-xl font-semibold mb-3">{t(item.titleKey)}</h3>
      <p className="text-white/50 leading-relaxed">{t(item.descKey)}</p>
    </motion.div>
  );
}

/* ─────────────────────────── main page ───────────────────── */

export default function DeepayLandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const ctaRef = useRef<HTMLElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  const featuresRef = useRef<HTMLElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* ── Nav ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg width="18" height="18" viewBox="0 0 60 60" fill="none">
                <path
                  d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="font-['Outfit'] text-lg font-bold tracking-tight">DeePay</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { key: 'nav.product', href: '#prodotto' },
              { key: 'nav.security', href: '#sicurezza' },
              { key: 'nav.pricing', href: '#prezzi' },
              { key: 'nav.blog', href: '#blog' },
            ].map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageDropdown theme="dark" />
            <a
              href="/user/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors duration-200"
            >
              {t('nav.login')}
            </a>
            <a
              href="/user/register"
              className="px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg shadow-black/20"
            >
              {t('nav.register')}
            </a>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageDropdown theme="dark" />
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={t('nav.openMenu')}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 mx-0 rounded-2xl border border-white/10 bg-[#111]/95 backdrop-blur-xl p-4"
          >
            <nav className="flex flex-col gap-1 mb-4">
              {[
                { key: 'nav.product', href: '#prodotto' },
                { key: 'nav.security', href: '#sicurezza' },
                { key: 'nav.pricing', href: '#prezzi' },
                { key: 'nav.blog', href: '#blog' },
              ].map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="px-4 py-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-white/8">
              <a href="/user/login" className="px-4 py-3 text-sm text-center text-white/70 hover:text-white transition-colors">
                {t('nav.login')}
              </a>
              <a
                href="/user/register"
                className="px-4 py-3 text-sm font-semibold text-center bg-white text-black rounded-full hover:bg-white/90 transition-all"
              >
                {t('nav.register')}
              </a>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-20"
            style={{
              background: 'radial-gradient(ellipse, #10B981 0%, #0d3f8f 45%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-10"
            style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
          />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('hero.badge')}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="font-['Outfit'] text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8"
          >
            {t('hero.headline1')}{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                {t('hero.headline2')}
              </span>
            </span>
            {t('hero.headline3') && (
              <>
                <br />
                {t('hero.headline3')}
              </>
            )}
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="text-xl md:text-2xl text-white/55 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            {t('hero.sub')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="/user/register"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black text-base font-semibold rounded-full hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-2xl shadow-white/10"
            >
              {t('hero.cta_primary')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#prodotto"
              className="flex items-center gap-2 px-8 py-4 border border-white/15 text-white/80 text-base font-medium rounded-full hover:bg-white/5 hover:border-white/25 hover:text-white active:scale-[0.98] transition-all duration-200"
            >
              {t('hero.cta_secondary')}
              <ChevronRight className="w-4 h-4 opacity-60" />
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-white/35"
          >
            {(['trust.psd2', 'trust.gdpr', 'trust.iso', 'trust.soc2'] as const).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t(key)}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── KPI Band ── */}
      <section className="relative border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/8">
          {KPI_DATA.map((kpi, i) => (
            <KpiCard key={kpi.labelKey} kpi={kpi} index={i} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="prodotto"
        ref={featuresRef}
        className="relative py-28 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">
              {t('features.label')}
            </span>
            <h2 className="font-['Outfit'] text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t('features.headline')}
              <br className="hidden md:block" />
              <span className="text-white/50"> {t('features.headline_muted')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
              {t('features.sub')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_DEFS.map((feature, i) => (
              <FeatureCard key={feature.titleKey} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative py-28 px-6 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">
              {t('how.label')}
            </span>
            <h2 className="font-['Outfit'] text-4xl md:text-5xl font-bold tracking-tight">
              {t('how.headline')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
            {HOW_IT_WORKS_DEFS.map((item, index) => (
              <HowItWorksStep key={item.step} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Sicurezza callout ── */}
      <section id="sicurezza" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-10"
          >
            <div className="flex-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="font-['Outfit'] text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {t('security.headline')}
              </h2>
              <p className="text-white/55 text-lg leading-relaxed max-w-lg">
                {t('security.desc')}
              </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-4">
              {['PSD2', 'GDPR', 'ISO 27001', 'SOC 2'].map((cert) => (
                <div
                  key={cert}
                  className="px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-white/80">{cert}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        ref={ctaRef}
        className="relative py-32 px-6 text-center overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(16,185,129,0.25) 0%, transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h2 className="font-['Outfit'] text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t('cta.headline1')}
            <br />{t('cta.headline2')}
          </h2>
          <p className="text-white/50 text-xl mb-12 leading-relaxed">
            {t('cta.sub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/user/register"
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-emerald-500 text-white text-base font-semibold rounded-full hover:bg-emerald-400 active:scale-[0.98] transition-all duration-200 shadow-2xl shadow-emerald-500/30"
            >
              {t('cta.primary')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/15 text-white/80 text-base font-medium rounded-full hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              {t('cta.secondary')}
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 60 60" fill="none">
                    <path d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z" fill="white" />
                  </svg>
                </div>
                <span className="font-['Outfit'] font-bold">DeePay</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white/80">{t('footer.col.product')}</h4>
              <ul className="space-y-3">
                {(['footer.product.features', 'footer.product.pricing', 'footer.product.security', 'footer.product.api'] as const).map((key) => (
                  <li key={key}>
                    <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {t(key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-white/80">{t('footer.col.company')}</h4>
              <ul className="space-y-3">
                {(['footer.company.about', 'footer.company.blog', 'footer.company.careers', 'footer.company.contact'] as const).map((key) => (
                  <li key={key}>
                    <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {t(key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-white/80">{t('footer.col.support')}</h4>
              <ul className="space-y-3">
                {(['footer.support.help', 'footer.support.status', 'footer.support.developers', 'footer.support.terms'] as const).map((key) => (
                  <li key={key}>
                    <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {t(key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('footer.status')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
