import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy, ArrowUpRight, ArrowDownLeft, Percent, Repeat,
  Eye, EyeOff, X, Headphones, Bell,
  TrendingUp, Send, QrCode, ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  onAddMoney: () => void;
  onTransfer: () => void;
  onOpenProfile: () => void;
  onSupport?: () => void;
}

function CopyBtn({ text, dark = false }: { text: string; dark?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1400); }}
      className="p-1.5 rounded-lg transition-colors flex-shrink-0"
      style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
    >
      <AnimatePresence mode="wait">
        {ok
          ? <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} /></motion.div>
          : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="w-3.5 h-3.5" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#A1A1AA' }} /></motion.div>
        }
      </AnimatePresence>
    </button>
  );
}

const TXS = [
  { id:1, date:'08 Apr. 2026', title:'4% Yield',          time:'02:13', amount:'+€0.01',  icon:Percent,       bg:'#18181B', fg:'#4ADE80', positive:true  },
  { id:2, date:'22 Mar. 2026', title:'EUR → SOL',          time:'05:22', amount:'-€49',    icon:Repeat,        bg:'#18181B', fg:'#fff',    positive:false, sub:'0.63 SOL' },
  { id:3, date:'21 Mar. 2026', title:'Transfer · Marco',   time:'14:35', amount:'-€120',   icon:ArrowUpRight,  bg:'#F4F4F5', fg:'#18181B', positive:false },
  { id:4, date:'20 Mar. 2026', title:'Payment received',   time:'09:10', amount:'+€350',   icon:ArrowDownLeft, bg:'#F4F4F5', fg:'#18181B', positive:true  },
];

const IBAN  = 'IT89 1774 8019 84IT 3931 6333 343';
const BIC   = 'DEEPIT22XXX';

export function HomePage({ onAddMoney, onTransfer, onOpenProfile, onSupport }: HomePageProps) {
  const [vis,  setVis]    = useState(true);
  const [iban, setIban]   = useState(false);
  const [bye,  setBye]    = useState(false);

  const grouped: Record<string, typeof TXS> = {};
  TXS.forEach(t => (grouped[t.date] ??= []).push(t));

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#F2F2F7' }}>

      {/* ═══ HERO CARD ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
        className="mx-3 mt-3 rounded-[32px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0A0A0A 0%, #141414 50%, #1C1C1C 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
          minHeight: 230,
        }}
      >
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.028]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)`,
          backgroundSize: '24px 24px',
        }} />
        {/* Green glow */}
        <motion.div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(74,222,128,0.14) 0%,transparent 70%)', filter: 'blur(32px)' }}
          animate={{ opacity:[0.6,1,0.6] }}
          transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
        />
        {/* Shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(74,222,128,0.25) 50%,transparent 100%)' }} />

        {/* Top row */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenProfile}
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-sm font-bold text-white">U</span>
          </motion.button>
          <div className="flex items-center gap-1">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onSupport}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Headphones className="w-4 h-4 text-white/50" strokeWidth={1.8} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full flex items-center justify-center relative transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Bell className="w-4 h-4 text-white/50" strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
            </motion.button>
          </div>
        </div>

        {/* Balance */}
        <div className="relative z-10 px-5 pt-2 pb-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>总余额</p>
          <button onClick={() => setVis(v => !v)} className="flex items-baseline gap-1 mb-3">
            <span className="text-lg font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>€</span>
            <span className="font-bold leading-none tracking-tight font-['Outfit'] text-white" style={{ fontSize: 54 }}>
              {vis ? '1' : '••'}
            </span>
            <span className="font-bold leading-none" style={{ fontSize: 30, color: 'rgba(255,255,255,0.35)' }}>
              {vis ? '.02' : ''}
            </span>
            <span className="ml-1.5">{vis
              ? <Eye className="w-4 h-4 inline" style={{ color: 'rgba(255,255,255,0.25)' }} />
              : <EyeOff className="w-4 h-4 inline" style={{ color: 'rgba(255,255,255,0.25)' }} />}
            </span>
          </button>
          {/* Yield pill */}
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 mb-4"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)' }}
            whileTap={{ scale: 0.96 }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} strokeWidth={2.5} />
            <span className="text-xs font-bold" style={{ color: '#4ADE80' }}>4% 年化收益</span>
          </motion.div>
        </div>

        {/* IBAN chip */}
        <div className="relative z-10 px-5 pb-4">
          <button onClick={() => setIban(v => !v)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {iban ? IBAN : 'IT89 ···· ···· 6333 343'}
            </span>
            {iban && <CopyBtn text={IBAN} dark />}
          </button>
        </div>

        {/* 4 Quick actions */}
        <div className="relative z-10 px-4 pb-5">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { icon: ArrowDownLeft, label: '入账',  fn: onAddMoney,  accent: true  },
              { icon: Send,          label: '汇款',  fn: onTransfer,  accent: false },
              { icon: QrCode,        label: '收款',  fn: undefined,   accent: false },
              { icon: ChevronRight,  label: '更多',  fn: undefined,   accent: false },
            ].map(({ icon: Ic, label, fn, accent }, i) => (
              <motion.button key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, ease: [0.22,1,0.36,1] }}
                whileTap={{ scale: 0.88 }}
                onClick={fn}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-12 h-12 rounded-[18px] flex items-center justify-center transition-all"
                  style={accent
                    ? { background: '#4ADE80', boxShadow: '0 0 20px rgba(74,222,128,0.4)' }
                    : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }
                  }>
                  <Ic className="w-5 h-5" style={{ color: accent ? '#000' : 'rgba(255,255,255,0.75)' }} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-semibold tracking-wide" style={{ color: accent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' }}>{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ IBAN DETAIL CARD ═══ */}
      <AnimatePresence>
        {iban && (
          <motion.div
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            transition={{ duration:0.25, ease:[0.4,0,0.2,1] }}
            className="overflow-hidden mx-3 mt-2"
          >
            <div className="rounded-[20px] overflow-hidden" style={{ background:'#fff', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
              {[{ k:'收款人', v:'La mia azienda' }, { k:'IBAN', v:IBAN }, { k:'BIC', v:BIC }].map((r, i, arr) => (
                <div key={r.k} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length-1 ? 'border-b border-neutral-100' : ''}`}>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color:'#4ADE80' }}>{r.k}</p>
                    <p className="text-sm font-mono text-neutral-800">{r.v}</p>
                  </div>
                  <CopyBtn text={r.v} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ REFERRAL BANNER ═══ */}
      <AnimatePresence>
        {!bye && (
          <motion.div
            initial={{ opacity:0, scale:0.97 }}
            animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:0.95, height:0, marginTop:0 }}
            transition={{ duration:0.22 }}
            className="mx-3 mt-3 rounded-[20px] overflow-hidden"
            style={{ background:'#fff', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-[14px] flex items-center justify-center flex-shrink-0 text-base"
                style={{ background:'#F4F4F5' }}>🎁</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-900">邀友赚 €100 / 位</p>
                <p className="text-xs text-neutral-400 mt-0.5">截止 4月23日</p>
              </div>
              <button onClick={() => setBye(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 flex-shrink-0 transition-colors">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TRANSACTIONS ═══ */}
      <div className="mt-3 pb-4">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="px-5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">{date}</p>
            <div className="mx-3 rounded-[20px] overflow-hidden mb-1" style={{ background:'#fff', boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
              {txs.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity:0, x:-6 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center px-4 py-3.5 active:bg-neutral-50 transition-colors cursor-pointer ${i < txs.length-1 ? 'border-b border-neutral-100/80' : ''}`}
                >
                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center mr-3 flex-shrink-0" style={{ background: tx.bg }}>
                    <tx.icon className="w-[18px] h-[18px]" style={{ color: tx.fg }} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-neutral-900 truncate">{tx.title}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{tx.time}{(tx as any).sub ? ` · ${(tx as any).sub}` : ''}</p>
                  </div>
                  <span className={`text-[13.5px] font-bold tabular-nums ${tx.positive ? '' : 'text-neutral-800'}`}
                    style={tx.positive ? { color:'#16A34A' } : {}}>
                    {tx.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
