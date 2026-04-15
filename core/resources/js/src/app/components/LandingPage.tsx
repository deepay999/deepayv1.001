import { motion } from 'framer-motion';
import { Apple, ChevronRight, PlayCircle, BadgeCheck, Building2, CreditCard, Globe, ShieldCheck, Sparkles, Wallet2, X, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getAppBootstrap } from '../lib/bootstrap';
import { HomePage } from './HomePage';
import { CardsPage } from './CardsPage';
import { TransferPage } from './TransferPage';
import { VaultsPage } from './VaultsPage';
import paymentVideo from '../../imports/[V9]_KRAK_CARD_-_Payment_Cutdown_compressed_-_1920x1080.mp4';
import objectsVideo from '../../imports/objects_low_res_(1).mp4';

interface LandingPageProps {
  onClose?: () => void;
}

export function LandingPage({ onClose }: LandingPageProps) {
  useTheme();

  const bootstrap = getAppBootstrap();
  const accent = 'from-[#7CFF6B] via-[#2EEA8B] to-[#0DBA59]';
  const accentText = 'text-emerald-300';
  const accentDot = 'bg-emerald-400';
  const accentSoft = 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100';

  const stats = [
    { value: '42', suffix: 'M+', label: '年度支付处理规模' },
    { value: '180', suffix: '+', label: '覆盖国家与结算走廊' },
    { value: '0.7', suffix: 's', label: '平均付款授权耗时' }
  ];

  const features = [
    {
      icon: Wallet2,
      title: '一个钱包，多条资金通道。',
      description: '卡片、转账、钱包余额与代发流程统一收敛到同一个运营界面。'
    },
    {
      icon: Zap,
      title: '更快完成清结算。',
      description: '支持实时网络时优先走快路，不支持时也能平滑回落到本地清算链路。'
    },
    {
      icon: Globe,
      title: '为跨境团队而生。',
      description: '本地余额、员工卡和风控控制台统一管理，不再把财务链路拆散到多套系统。'
    },
    {
      icon: ShieldCheck,
      title: '默认带着风控能力。',
      description: '审批、策略、设备信任和审计记录不是外挂，而是产品体验本身的一部分。'
    }
  ];

  const rails = ['用户钱包', '发卡管理', '商户资金池', '代发编排', '合规审核', '汇率路由'];

  const principles = [
    {
      title: '按业务组织资金账户',
      body: '账户围绕团队、产品和司法辖区组织，权限设计直接映射真实资金流向。'
    },
    {
      title: '界面本身解释信任',
      body: '每个版块都优先展示风控、审批与清算逻辑，用户不看文档也能理解系统可靠性。'
    },
    {
      title: '先上线，再逐层加深',
      body: '先用钱包和收付款跑通主链路，再逐步叠加发卡、区域扩展和更重的审批策略。'
    }
  ];

  const steps = [
    { number: '01', title: '开通运营钱包', description: '在一条初始化流程里完成余额配置、身份校验和主币种设定。' },
    { number: '02', title: '接入资金通道', description: '把卡、账户与收款目的地接入同一套审批规则，匹配你的团队结构。' },
    { number: '03', title: '把日常资金工作跑在同一闭环', description: '资金池、转账和支出都回到同一本账和同一条活动流里核对。' }
  ];

  const marqueeItems = [
    '实时资金总览',
    '跨境钱包基础设施',
    '发卡与限额控制',
    '审批优先的支付流程',
    'DeePay 原生体验',
    '克制但高级的品牌叙事'
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute left-[8%] top-16 h-72 w-72 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-[120px]`} />
        <div className="absolute right-[5%] top-[20%] h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#060816]/75 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} shadow-[0_12px_40px_rgba(16,185,129,0.25)]`}>
                <span className="text-lg font-bold text-white">D</span>
              </div>
              <div>
                <div className="font-['Outfit'] text-2xl font-semibold tracking-tight">DeePay</div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">钱包 卡片 代发</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#platform" className="text-sm text-white/60 transition-colors hover:text-white">平台能力</a>
              <a href="#showcase" className="text-sm text-white/60 transition-colors hover:text-white">产品展示</a>
              <a href="#controls" className="text-sm text-white/60 transition-colors hover:text-white">控制能力</a>
              <a href="#download" className="text-sm text-white/60 transition-colors hover:text-white">立即体验</a>
            </div>
            <div className="flex items-center gap-3">
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                进入应用
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <section className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-4 mt-[88px]">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
          className="flex w-max items-center gap-3 whitespace-nowrap"
        >
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center gap-3 px-4 text-sm text-white/55">
              <span className={`h-2 w-2 rounded-full ${accentDot}`} />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="relative px-6 pb-16 pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid items-start gap-16 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] ${accentSoft}`}>
                <Sparkles className="h-3.5 w-3.5" />
                高端钱包、发卡与代发一体化编排
              </div>
              <h1 className="max-w-4xl font-['Outfit'] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                把 DeePay 做成一个
                <span className={`block bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
                  冷静、迅速、可信的资金入口。
                </span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                DeePay 面向钱包、卡片和全球资金流转场景。页面先传达信任感，再把风控、审批与清算控制权交回给运营团队。
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition-colors hover:bg-white/90">
                  打开产品演示
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  <PlayCircle className="h-4 w-4" />
                  查看品牌动效
                </motion.button>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                    <div className="font-['Outfit'] text-4xl font-semibold tracking-tight">
                      {stat.value}
                      <span className={`ml-1 ${accentText}`}>{stat.suffix}</span>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/55">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-3 text-sm text-white/45">
                {rails.map((rail) => (
                  <span key={rail} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                    {rail}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="relative">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/10 bg-white/5 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,20,38,0.96),rgba(7,9,20,0.98))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/40">运营钱包</div>
                    <div className="mt-1 font-['Outfit'] text-2xl font-semibold">EUR 18,420.15</div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
                    <Wallet2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between text-white/55">
                      <span className="text-xs uppercase tracking-[0.2em]">卡片支出</span>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="mt-6 font-['Outfit'] text-3xl font-semibold">€128.4k</div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                      <span className={`h-2 w-2 rounded-full ${accentDot}`} />
                      本季度风控告警下降 12.4%
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between text-white/55">
                      <span className="text-xs uppercase tracking-[0.2em]">审批链路</span>
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                    <div className="mt-6 font-['Outfit'] text-3xl font-semibold">3-step</div>
                    <div className="mt-3 text-sm text-white/60">设备信任、策略匹配与最终复核共同生效</div>
                  </div>
                </div>
                <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
                  <video autoPlay loop muted playsInline className="h-full w-full object-cover" src={paymentVideo} />
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">清算区域</div>
                    <div className="mt-4 space-y-3">
                      {['巴黎资金池', '迪拜代发', '香港运营'].map((item) => (
                        <div key={item} className="flex items-center justify-between text-sm text-white/72">
                          <span>{item}</span>
                          <span className={accentText}>在线</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">控制中心</div>
                      <Building2 className="h-4 w-4 text-white/45" />
                    </div>
                    <div className="mt-4 space-y-4">
                      {[
                        ['代发审批时段', '08:00-19:00 CET'],
                        ['单日卡片额度', '€7,500 / 员工'],
                        ['汇率路径偏好', '自动优化']
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                          <span className="text-white/55">{label}</span>
                          <span className="font-medium text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="platform" className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <div className={`mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] ${accentText}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                为什么这页看起来可信
              </div>
              <h2 className="font-['Outfit'] text-4xl font-semibold leading-tight">不是照抄别家金融站，而是做出 DeePay 自己的落地页。</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/62">
                设计语言保留金融产品应有的克制、高密度和可信线索，但结构、文案与节奏都针对 DeePay 重新组织，不再借别人的品牌外壳说话。
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 transition-transform hover:-translate-y-1"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} mb-6`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-['Outfit'] text-2xl font-medium">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] ${accentText}`}>
                <Globe className="h-3.5 w-3.5" />
                产品界面
              </div>
              <h2 className="font-['Outfit'] text-4xl font-semibold sm:text-5xl">营销质感必须建立在真实可用的产品界面上。</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              这页不只是情绪板和渐变背景，它直接复用 DeePay 的真实应用界面，让品牌承诺落在真实产品之上。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between px-2 text-sm text-white/55">
                <span>卡片体验与交易动线展示</span>
                <span className={accentText}>实时预览</span>
              </div>
              <video autoPlay loop muted playsInline className="h-full w-full rounded-[1.5rem] object-cover" src={paymentVideo} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between px-2 text-sm text-white/55">
                <span>品牌动效与 3D 物料系统</span>
                <span className={accentText}>循环播放</span>
              </div>
              <video autoPlay loop muted playsInline className="h-full w-full rounded-[1.5rem] object-cover" src={objectsVideo} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-['Outfit'] text-4xl font-semibold sm:text-5xl">最好的宣传方式，是把产品本身展示出来。</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/58 sm:text-lg">可滚动设备框架既保留展示质感，也让用户更直观理解 DeePay 真正的使用体验。</p>
          </motion.div>

          <div className="relative">
            <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="flex-shrink-0 snap-center">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">首页</h3>
                  <p className="text-sm text-white/55">实时余额、交易摘要和快捷操作</p>
                </div>
                <div className="relative mx-auto" style={{ width: '320px', height: '650px' }}>
                  <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-3">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-2xl z-10" />
                    <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="absolute inset-0 scale-[0.38] origin-top-left" style={{ width: '390px', height: '844px' }}>
                        <HomePage bootstrap={bootstrap} onAddMoney={() => {}} onTransfer={() => {}} onOpenProfile={() => {}} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex-shrink-0 snap-center">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">卡片</h3>
                  <p className="text-sm text-white/55">真实发卡状态、限额和卡片资产展示</p>
                </div>
                <div className="relative mx-auto" style={{ width: '320px', height: '650px' }}>
                  <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-3">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-2xl z-10" />
                    <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="absolute inset-0 scale-[0.38] origin-top-left" style={{ width: '390px', height: '844px' }}>
                        <CardsPage bootstrap={bootstrap} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex-shrink-0 snap-center">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">转账</h3>
                  <p className="text-sm text-white/55">低阻力的转账路径和清晰的金额反馈</p>
                </div>
                <div className="relative mx-auto" style={{ width: '320px', height: '650px' }}>
                  <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-3">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-2xl z-10" />
                    <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="absolute inset-0 scale-[0.38] origin-top-left" style={{ width: '390px', height: '844px' }}>
                        <TransferPage bootstrap={bootstrap} onQuickTransfer={() => {}} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex-shrink-0 snap-center">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">钱包总览</h3>
                  <p className="text-sm text-white/55">余额、卡资产和近期资金活动集中呈现</p>
                </div>
                <div className="relative mx-auto" style={{ width: '320px', height: '650px' }}>
                  <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-3">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-2xl z-10" />
                    <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="absolute inset-0 scale-[0.38] origin-top-left" style={{ width: '390px', height: '844px' }}>
                        <VaultsPage bootstrap={bootstrap} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="controls" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <div className={`mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] ${accentText}`}>
                <BadgeCheck className="h-3.5 w-3.5" />
                设计原则
              </div>
              <h2 className="font-['Outfit'] text-4xl font-semibold leading-tight">在用户看文档之前，前端先把产品逻辑讲清楚。</h2>
              <div className="mt-8 space-y-6">
                {principles.map((item) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/58">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-7"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className={`font-['Outfit'] text-5xl font-semibold ${accentText}`}>{step.number}</div>
                      <h3 className="mt-4 font-['Outfit'] text-2xl font-medium">{step.title}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">{step.description}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/45">
                      步骤 {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="download" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,17,29,0.95),rgba(9,11,22,1))] p-12 text-center text-white">
            <div className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] ${accentText}`}>
              <Apple className="h-3.5 w-3.5" />
              可直接上线的行动入口
            </div>
            <h2 className="font-['Outfit'] text-4xl font-semibold sm:text-5xl">用户一打开页面，就能理解 DeePay 想解决什么问题。</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">从注册、入金、发卡到转账，整个故事都围绕同一套钱包能力展开，既足够清晰，也足够专业。</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-white text-black px-8 py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-neutral-100 transition-colors">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">移动端</div>
                  <div className="text-base font-bold">即将上线</div>
                </div>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="border border-white/10 bg-white/5 text-white px-8 py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
                <PlayCircle className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs text-white/55">立即打开</div>
                  <div className="text-base font-bold">交互演示</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${accent}`}>
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold font-['Outfit']">DeePay</span>
              </div>
              <p className="text-sm text-white/50">面向现代钱包、卡片和全球支付场景的 DeePay 品牌落地页。</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">平台</h4>
              <div className="space-y-2">
                <a href="#platform" className="block text-sm text-white/50 hover:text-white">能力概览</a>
                <a href="#showcase" className="block text-sm text-white/50 hover:text-white">界面展示</a>
                <a href="#controls" className="block text-sm text-white/50 hover:text-white">控制逻辑</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">使用场景</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-white/50 hover:text-white">用户钱包</a>
                <a href="#" className="block text-sm text-white/50 hover:text-white">资金团队</a>
                <a href="#" className="block text-sm text-white/50 hover:text-white">跨境代发</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">控制能力</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-white/50 hover:text-white">审批流</a>
                <a href="#" className="block text-sm text-white/50 hover:text-white">风险复核</a>
                <a href="#" className="block text-sm text-white/50 hover:text-white">审计留痕</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/35">© 2026 DeePay. 保留所有权利。</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/35 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-white/35 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-white/35 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}