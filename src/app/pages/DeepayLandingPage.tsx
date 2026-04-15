import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Zap,
  CreditCard,
  Bitcoin,
  Headphones,
  Menu,
  X,
  Twitter,
  Linkedin,
  Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageDropdown } from '../../i18n/LanguageDropdown';

/* ─────────────────────────── Logo SVG ────────────────────── */
function DeepayLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path
        d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z"
        fill="white"
      />
    </svg>
  );
}

/* ─────────────────────────── Section wrapper ─────────────── */
function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Content section card ────────── */
function ContentSection({
  icon: Icon,
  iconColor,
  title,
  body,
  reverse = false,
  index = 0,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  body: string;
  reverse?: boolean;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: reverse ? 40 : -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}
    >
      {/* Icon illustration */}
      <div
        className="flex-shrink-0 w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: `${iconColor}18` }}
      >
        <Icon className="w-9 h-9" style={{ color: iconColor }} />
      </div>
      {/* Text */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="font-['Outfit'] text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {title}
        </h2>
        <p className="text-white/55 text-lg leading-relaxed max-w-xl">{body}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── Footer link group ────────────── */
function FooterGroup({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-4 text-white/80">{heading}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────── Main page ───────────────────── */
export default function DeepayLandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* ── Nav items ── */
  const NAV_ITEMS = [
    { label: t('Discover'),     href: '#discover' },
    { label: t('Pricing plan'), href: '#pricing'  },
  ];

  /* ── Footer link groups ── */
  const FOOTER_GROUPS = [
    {
      heading: t('Company'),
      links: [
        { label: t('Home'),        href: '/'             },
        { label: t('About'),       href: '/about'        },
        { label: t('Press'),       href: '/press'        },
        { label: t('Career'),      href: '/career'       },
        { label: t('Ambassadors'), href: '/ambassadors'  },
        { label: t('Verify'),      href: '/verify'       },
        { label: t('Status'),      href: '/status'       },
      ],
    },
    {
      heading: t('Product'),
      links: [
        { label: t('Features'),        href: '/features'        },
        { label: t('Business'),        href: '/business'        },
        { label: t('Pricing plan'),    href: '#pricing'         },
        { label: t('Bursted Bubbles'), href: '/bursted-bubbles' },
        { label: t('Crypto Market'),   href: '/crypto-market'   },
        { label: t('Exchange'),        href: '/exchange'        },
        { label: t('Suggestions'),     href: '/suggestions'     },
      ],
    },
    {
      heading: t('Help'),
      links: [
        { label: t('Help'),    href: '/help'    },
        { label: t('Contact'), href: '/contact' },
        { label: t('Twitter'), href: '#'        },
        { label: t('FAQ'),     href: '/faq'     },
      ],
    },
    {
      heading: t('Legal & Compliance'),
      links: [
        { label: t('Legal Agreements'), href: '/legal'   },
        { label: t('Website terms'),    href: '/terms'   },
        { label: t('Privacy'),          href: '/privacy' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HEADER / NAV
      ══════════════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <DeepayLogo size={18} />
            </div>
            <span className="font-['Outfit'] text-lg font-bold tracking-tight">DeePay</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs + language */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageDropdown />
            <a
              href="/user/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors duration-200"
            >
              {t('Login')}
            </a>
            <a
              href="/user/register"
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-all duration-200 shadow-lg shadow-black/20"
            >
              {t('Sign up')}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 rounded-2xl border border-white/10 bg-[#111]/95 backdrop-blur-xl p-4"
          >
            <nav className="flex flex-col gap-1 mb-3">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-3 border-t border-white/8">
              <div className="px-4 py-2">
                <LanguageDropdown />
              </div>
              <a href="/user/login" className="px-4 py-3 text-sm text-center text-white/70 hover:text-white transition-colors">
                {t('Login')}
              </a>
              <a
                href="/user/register"
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-center bg-white text-black rounded-full hover:bg-white/90 transition-all"
              >
                {t('Sign up')}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-20"
            style={{ background: 'radial-gradient(ellipse, #10B981 0%, #0d3f8f 45%, transparent 70%)' }}
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
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="font-['Outfit'] text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8"
          >
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              {t('Take control of your money')}
            </span>
          </motion.h1>

          {/* Sub-features */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="text-xl md:text-2xl text-white/55 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            {t('Current account')}
            {'  ·  '}
            {t('VISA card')}
            {'  ·  '}
            {t('Crypto wallet')}
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
              {t('Sign up')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/user/login"
              className="flex items-center gap-2 px-8 py-4 border border-white/15 text-white/80 text-base font-medium rounded-full hover:bg-white/5 hover:border-white/25 hover:text-white active:scale-[0.98] transition-all duration-200"
            >
              {t('Login')}
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — SOCIAL PROOF
      ══════════════════════════════════════════ */}
      <section className="relative border-y border-white/8 bg-white/[0.02] py-16 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
        />
        <FadeInSection>
          <p className="font-['Outfit'] text-3xl md:text-5xl font-bold tracking-tight text-white relative z-10">
            {t('Join hundreds of thousands of users')}
          </p>
        </FadeInSection>
      </section>

      {/* ══════════════════════════════════════════
          CONTENT SECTIONS 3–6
      ══════════════════════════════════════════ */}
      <section id="discover" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-24">

          {/* Section 3 — Forget your bank */}
          <ContentSection
            icon={Zap}
            iconColor="#10B981"
            title={t('Forget your bank account')}
            body={t('DeePay provides: IBAN, cards, instant bank transfers, fiat & crypto exchange — all free with zero bank fees.')}
            index={0}
          />

          {/* Section 4 — Unique debit card */}
          <ContentSection
            icon={CreditCard}
            iconColor="#3B82F6"
            title={t('Stand out with a unique debit card')}
            body={t('Pay worldwide, bind Alipay & WeChat')}
            reverse
            index={1}
          />

          {/* Section 5 — Crypto deposit */}
          <ContentSection
            icon={Bitcoin}
            iconColor="#F59E0B"
            title={t('Deposit your crypto with no limits')}
            body={t('Deposit and withdraw crypto without any restrictions. Convert to EUR or other crypto anytime.')}
            index={2}
          />

          {/* Section 6 — Support */}
          <ContentSection
            icon={Headphones}
            iconColor="#8B5CF6"
            title={t('We keep you protected')}
            body={t('24/7 AI support with human agents available when you need them')}
            reverse
            index={3}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECURITY CALLOUT
      ══════════════════════════════════════════ */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeInSection>
            <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-10">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="font-['Outfit'] text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                  {t('We keep you protected')}
                </h2>
                <p className="text-white/55 text-lg leading-relaxed max-w-lg">
                  {t('24/7 AI support with human agents available when you need them')}
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-wrap gap-4 justify-center md:justify-end">
                {['GDPR', 'SSL', '2FA', '24/7'].map((cert) => (
                  <div
                    key={cert}
                    className="px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-center min-w-[80px]"
                  >
                    <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-white/80">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(16,185,129,0.25) 0%, transparent 70%)' }}
        />
        <FadeInSection className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-['Outfit'] text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t('Take control of your money')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/user/register"
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-emerald-500 text-white text-base font-semibold rounded-full hover:bg-emerald-400 active:scale-[0.98] transition-all duration-200 shadow-2xl shadow-emerald-500/30"
            >
              {t('Sign up')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 border border-white/15 text-white/80 text-base font-medium rounded-full hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              {t('Contact')}
            </a>
          </div>
        </FadeInSection>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="border-t border-white/8 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top: brand + columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center">
                  <DeepayLogo size={15} />
                </div>
                <span className="font-['Outfit'] font-bold">DeePay</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-5">
                {t('The digital finance app for everyone.')}
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="Telegram"
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_GROUPS.map((group) => (
              <FooterGroup key={group.heading} heading={group.heading} links={group.links} />
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
            <p>© {new Date().getFullYear()} DeePay — {t('All rights reserved.')}</p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('Services operational')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
