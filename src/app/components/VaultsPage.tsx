import { motion } from 'motion/react';
import { ChevronRight, Info } from 'lucide-react';

const VAULTS = [
  { symbol: 'ETH',  yield: 'up to 1.27%', letter: 'Ξ', bg: '#18181B', fg: '#fff'     },
  { symbol: 'USD',  yield: 'up to 3.97%', letter: '$', bg: '#18181B', fg: '#4ADE80'  },
  { symbol: 'EURO', yield: 'up to 3.59%', letter: '€', bg: '#18181B', fg: '#fff'     },
];

function PixelAvatar() {
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0" style={{ background:'#1C1C1E' }}>
      <svg viewBox="0 0 8 8" width="44" height="44" style={{ imageRendering:'pixelated' }}>
        <rect x="2" y="1" width="4" height="4" fill="#F5C57A"/>
        <rect x="1" y="0" width="6" height="2" fill="#111"/>
        <rect x="2" y="2" width="1" height="1" fill="#111"/>
        <rect x="5" y="2" width="1" height="1" fill="#111"/>
        <rect x="1" y="5" width="6" height="3" fill="#3F3F3F"/>
      </svg>
    </div>
  );
}

export function VaultsPage() {
  return (
    <div className="h-full overflow-y-auto" style={{ background:'#F2F2F7' }}>
      <div className="px-5 pt-5 pb-3"><PixelAvatar /></div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
        className="mx-4 rounded-[28px] overflow-hidden"
        style={{ background:'#fff', boxShadow:'0 2px 20px rgba(0,0,0,0.08)' }}
      >
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color:'#A1A1AA' }}>Balance</p>
          <p className="leading-none font-['Outfit'] font-bold" style={{ fontSize:52, color:'#0A0A0A' }}>
            €<span style={{ fontSize:62 }}>0</span>.00
          </p>
        </div>
        <div className="border-t border-neutral-100 px-5 py-3.5 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color:'#A1A1AA' }} strokeWidth={2}/>
          <span className="text-[13px]" style={{ color:'#71717A' }}>Projected earnings: 0.00 / year</span>
        </div>
      </motion.div>

      {/* Available Vaults */}
      <div className="px-4 mt-5 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color:'#A1A1AA' }}>Available Vaults</p>
        <div className="space-y-2.5">
          {VAULTS.map((v, i) => (
            <motion.button
              key={v.symbol}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07+0.1, ease:[0.22,1,0.36,1] }}
              whileTap={{ scale:0.975 }}
              className="w-full rounded-[22px] px-4 py-4 flex items-center gap-4 active:opacity-80 transition-all"
              style={{ background:'#fff', boxShadow:'0 1px 10px rgba(0,0,0,0.06)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg"
                style={{ background: v.bg, color: v.fg, boxShadow: v.fg === '#4ADE80' ? '0 0 16px rgba(74,222,128,0.3)' : 'none' }}>
                {v.letter}
              </div>
              <span className="flex-1 text-left text-base font-bold" style={{ color:'#0A0A0A' }}>{v.symbol}</span>
              <span className="text-sm font-semibold mr-1" style={{ color:'#4ADE80' }}>{v.yield}</span>
              <ChevronRight className="w-4 h-4" style={{ color:'#D4D4D8' }} strokeWidth={2.5}/>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
