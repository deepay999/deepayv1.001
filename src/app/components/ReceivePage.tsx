import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Share2, Download, CheckCircle2, ChevronDown } from 'lucide-react';

const IBAN = 'IT89 1774 8019 84IT 3931 6333 343';
const BIC  = 'DEEPIT22XXX';
const UID  = '1874957242';

/* ── QR canvas ───────────────────────────────────────────── */
function QRCanvas({ url, size = 180 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoaded(false);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { ctx.drawImage(img, 0, 0, size, size); setLoaded(true); };
    img.onerror = () => {
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(0, 0, size, size);
      setLoaded(true);
    };
    img.src = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(url)}&choe=UTF-8&chld=M|2`;
  }, [url, size]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {!loaded && (
        <div className="absolute inset-0 rounded-2xl bg-neutral-100 animate-pulse" />
      )}
      <canvas
        ref={canvasRef}
        className="rounded-2xl"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
}

/* ── CopyRow ──────────────────────────────────────────────── */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-xs font-semibold text-blue-500 mb-0.5">{label}</p>
        <p className="text-sm font-mono text-neutral-800 leading-snug">{value}</p>
      </div>
      <button onClick={handle} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors flex-shrink-0 ml-3">
        <AnimatePresence mode="wait">
          {copied
            ? <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 className="w-4 h-4 text-emerald-500" /></motion.div>
            : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="w-4 h-4 text-neutral-400" /></motion.div>
          }
        </AnimatePresence>
      </button>
    </div>
  );
}

/* ── main ────────────────────────────────────────────────── */
export function ReceivePage() {
  const [tab, setTab]           = useState<'qr' | 'bank'>('qr');
  const [amount, setAmount]     = useState('');
  const [showPad, setShowPad]   = useState(false);

  const payURL = `${typeof window !== 'undefined' ? window.location.origin : 'https://deepay.app'}/pay/${UID}${amount ? `?amount=${amount}` : ''}`;

  const numKeys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const handleKey = (k: string) => {
    if (k === '⌫') { setAmount(v => v.slice(0, -1)); return; }
    if (!k) return;
    if (amount.length >= 8) return;
    setAmount(v => v + k);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'DeePay收款', url: payURL }).catch(() => {});
    } else {
      navigator.clipboard.writeText(payURL).catch(() => {});
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7] pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-1">
        <h1 className="text-xl font-bold text-neutral-900 mb-4">收款</h1>

        {/* Tab toggle */}
        <div className="flex border-b border-neutral-100">
          {([['qr', '收款码'], ['bank', '银行信息']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`mr-6 pb-3 text-sm font-semibold transition-colors relative ${
                tab === id ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              {label}
              {tab === id && (
                <motion.div
                  layoutId="receiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'qr' ? (
          <motion.div
            key="qr"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* QR card */}
            <div className="mx-4 mt-4">
              <div
                className="bg-white rounded-3xl overflow-hidden"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
              >
                {/* User info */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 60 60" fill="none">
                      <path d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">DeePay 账户</p>
                    <p className="text-xs text-neutral-400">UID: {UID}</p>
                  </div>
                  {amount && (
                    <div className="ml-auto text-right">
                      <p className="text-base font-bold text-emerald-600 font-['Outfit']">
                        €{parseFloat(amount).toLocaleString('it-IT')}
                      </p>
                      <p className="text-[10px] text-neutral-400">固定金额</p>
                    </div>
                  )}
                </div>

                {/* QR code */}
                <div className="flex flex-col items-center py-6">
                  <div className="p-3 bg-white rounded-2xl border border-neutral-100">
                    <QRCanvas url={payURL} size={180} />
                  </div>
                </div>

                {/* Amount toggle */}
                <div className="border-t border-neutral-100">
                  <button
                    onClick={() => setShowPad(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-700">
                      {amount ? `金额: €${parseFloat(amount).toLocaleString()}` : '添加收款金额（选填）'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform ${showPad ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showPad && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-neutral-100"
                      >
                        <div className="px-4 pt-3 pb-1 text-center">
                          <span className="font-['Outfit'] text-4xl font-bold text-neutral-900">
                            {amount ? `€${parseFloat(amount).toLocaleString()}` : '€0'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 px-4 pb-4 pt-2">
                          {numKeys.map((k, i) => (
                            <button
                              key={i}
                              onClick={() => handleKey(k)}
                              className={`h-11 rounded-2xl text-lg font-semibold transition-colors ${
                                k ? 'bg-neutral-100 active:bg-neutral-200 text-neutral-900' : 'bg-transparent'
                              }`}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neutral-900 text-white text-sm font-semibold"
              >
                <Share2 className="w-4 h-4" />
                分享
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-neutral-800 text-sm font-semibold border border-neutral-200"
              >
                <Download className="w-4 h-4" />
                保存图片
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="bank"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-4"
          >
            <div
              className="bg-white rounded-3xl px-5 py-2"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
            >
              <CopyRow label="收款人" value="La mia azienda" />
              <CopyRow label="IBAN"   value={IBAN} />
              <CopyRow label="BIC"    value={BIC} />
              <CopyRow label="UID"    value={UID} />
            </div>

            <p className="text-xs text-neutral-400 text-center mt-4 px-4 leading-relaxed">
              通过银行转账汇款到以上账户，通常需要 1-2 个工作日到账。
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
