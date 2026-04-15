import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlignJustify, Snowflake, Settings2, Plus } from 'lucide-react';

const CARDS = [
  { id:1, last4:'bb3b', network:'VISA', bg:'linear-gradient(145deg,#2A2A2A 0%,#111 100%)', accent:'#4ADE80' },
  { id:2, last4:'7709', network:'VISA', bg:'linear-gradient(145deg,#3A3A3A 0%,#1C1C1C 100%)', accent:'rgba(255,255,255,0.3)' },
];

function BankCard({ last4, network, bg, accent, frozen }: { last4:string; network:string; bg:string; accent:string; frozen:boolean }) {
  return (
    <motion.div
      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.45, type:'spring', stiffness:180 }}
      className="rounded-[28px] relative overflow-hidden flex-shrink-0"
      style={{ background:bg, aspectRatio:'1.586/1', width:'80vw', maxWidth:320,
        boxShadow:'0 20px 60px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset' }}
    >
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage:`linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)`,
        backgroundSize:'20px 20px'
      }}/>
      {/* Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
        style={{ background:`radial-gradient(circle,${accent}22 0%,transparent 70%)`, filter:'blur(24px)' }}/>
      {/* Shimmer top */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background:`linear-gradient(90deg,transparent,${accent}50,transparent)` }}/>
      {/* Frozen overlay */}
      <AnimatePresence>
        {frozen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px]"
            style={{ background:'rgba(10,10,10,0.75)', backdropFilter:'blur(6px)' }}>
            <div className="text-center">
              <Snowflake className="w-10 h-10 mx-auto mb-2" style={{ color:'#4ADE80' }}/>
              <p className="text-sm font-bold" style={{ color:'rgba(255,255,255,0.7)' }}>Card frozen</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Content */}
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-20">
        <span className="text-base font-mono tracking-widest" style={{ color:'rgba(255,255,255,0.55)' }}>·· {last4}</span>
        <span className="font-black text-xl tracking-wider italic" style={{ color:'rgba(255,255,255,0.9)' }}>{network}</span>
      </div>
      {/* Green chip dot */}
      <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full z-20"
        style={{ background:'#4ADE80', boxShadow:'0 0 10px rgba(74,222,128,0.7)' }}/>
    </motion.div>
  );
}

export function CardsPage() {
  const [frozen, setFrozen] = useState(false);
  const [activeCard] = useState(0);

  return (
    <div className="h-full overflow-y-auto" style={{ background:'#F2F2F7' }}>
      {/* + button */}
      <div className="flex justify-end px-5 pt-5 pb-2">
        <motion.button whileTap={{ scale:0.88 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background:'#fff', boxShadow:'0 1px 8px rgba(0,0,0,0.1)' }}>
          <Plus className="w-5 h-5" style={{ color:'#0A0A0A' }} strokeWidth={2}/>
        </motion.button>
      </div>

      {/* Cards carousel */}
      <div className="mt-4 mb-8 pl-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth:'none' }}>
        {CARDS.map((card, i) => (
          <div key={card.id} className="snap-start flex-shrink-0 transition-all duration-300"
            style={{ opacity: i===activeCard ? 1 : 0.45, transform: i===activeCard ? 'scale(1)' : 'scale(0.93)' }}>
            <BankCard {...card} frozen={frozen && i===activeCard}/>
          </div>
        ))}
        <div className="flex-shrink-0 w-4"/>
      </div>

      {/* 3 action buttons */}
      <div className="flex justify-center gap-10 mb-8">
        {[
          { icon:AlignJustify, label:'Details', active:false, onPress:undefined },
          { icon:Snowflake,    label:'Freeze',  active:frozen, onPress:() => setFrozen(v => !v) },
          { icon:Settings2,   label:'Settings', active:false, onPress:undefined },
        ].map(({ icon:Ic, label, active, onPress }) => (
          <button key={label} onClick={onPress} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={active
                ? { background:'#0A0A0A', boxShadow:'0 0 20px rgba(74,222,128,0.35)', border:'2px solid #4ADE80' }
                : { background:'#fff', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }
              }>
              <Ic className="w-5 h-5" style={{ color: active ? '#4ADE80' : '#18181B' }} strokeWidth={active ? 2.2 : 1.8}/>
            </div>
            <span className="text-xs font-semibold" style={{ color: active ? '#0A0A0A' : '#71717A' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Add to G Pay */}
      <div className="mx-5">
        <motion.button whileTap={{ scale:0.97 }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-white text-base font-bold"
          style={{ background:'#0A0A0A', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          <span>Add to</span>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"/>
            <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
            <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
            <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
          </svg>
          <span>Pay</span>
        </motion.button>
      </div>
    </div>
  );
}
