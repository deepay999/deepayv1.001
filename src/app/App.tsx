import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Coins, CreditCard, Wallet, QrCode, Star } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { CardsPage } from './components/CardsPage';
import { VaultsPage } from './components/VaultsPage';
import { ProfilePage } from './components/ProfilePage';
import { QRCodePage } from './components/QRCodePage';
import { PointsPage } from './components/PointsPage';
import { AddMoneyModal } from './components/AddMoneyModal';
import { SplashScreen } from './components/SplashScreen';
import { PageSwipeTransition } from './components/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';

/* ─── nav tab definition ──────────────────────────────────── */
const TABS = [
  { id: 'home',   icon: Home,       label: 'Home'        },
  { id: 'cripto', icon: Coins,       label: 'Cripto'      },
  { id: 'carte',  icon: CreditCard,  label: 'Carte'       },
  { id: 'assets', icon: Wallet,      label: 'Portafoglio' },
  { id: 'points', icon: Star,        label: 'Points'      },
];

/* ─── App ─────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab]             = useState('home');
  const [showTransferModal, setTransferModal]  = useState(false);
  const [showAddMoneyModal, setAddMoneyModal]  = useState(false);
  const [showSplash, setShowSplash]            = useState(true);
  const [showProfile, setShowProfile]          = useState(false);
  const [showQR, setShowQR]                    = useState(false);

  const renderPage = () => {
    if (showProfile) return <ProfilePage onBack={() => setShowProfile(false)} onViewWebsite={() => {}} />;
    if (showQR)      return <QRCodePage />;
    switch (activeTab) {
      case 'home':   return <HomePage onAddMoney={() => setAddMoneyModal(true)} onTransfer={() => setTransferModal(true)} onOpenProfile={() => setShowProfile(true)} />;
      case 'cripto': return <VaultsPage />;   // crypto/assets view
      case 'carte':  return <CardsPage />;
      case 'assets': return <VaultsPage />;   // full portfolio
      case 'points': return <PointsPage />;
      default:       return null;
    }
  };

  return (
    <ThemeProvider>
      {/* Splash */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Full-screen app wrapper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.4 }}
        className="fixed inset-0 flex flex-col bg-white overflow-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Page content (takes remaining height above nav) */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <PageSwipeTransition key={showProfile ? 'profile' : showQR ? 'qr' : activeTab}>
              {renderPage()}
            </PageSwipeTransition>
          </AnimatePresence>
        </div>

        {/* ── Bottom Navigation ── */}
        <AnimatePresence>
          {!showProfile && !showQR && (
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 3.1, duration: 0.3 }}
              className="flex-shrink-0 border-t border-neutral-100 bg-white"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <div className="flex items-center justify-around px-2 h-16">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.88 }}
                      className="flex flex-col items-center gap-1 px-3 py-1 relative"
                    >
                      {/* Pill background for active tab */}
                      {isActive && (
                        <motion.div
                          layoutId="navPill"
                          className="absolute inset-x-0 top-0 h-8 rounded-2xl bg-neutral-100"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <tab.icon
                        className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                          isActive ? 'text-neutral-900' : 'text-neutral-400'
                        }`}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      <span className={`text-[10px] font-medium relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-neutral-900' : 'text-neutral-400'
                      }`}>
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}

                {/* QR scan FAB — centre */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowQR(v => !v)}
                  className="flex flex-col items-center gap-1 px-3 py-1"
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      showQR
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-neutral-900 shadow-md shadow-black/20'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className={`text-[10px] font-medium ${showQR ? 'text-emerald-600' : 'text-neutral-400'}`}>
                    QR
                  </span>
                </motion.button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Back button when showing profile or QR */}
        <AnimatePresence>
          {(showProfile || showQR) && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => { setShowProfile(false); setShowQR(false); }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-semibold shadow-xl z-50"
              style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
            >
              ← Indietro
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <TransferModal isOpen={showTransferModal} onClose={() => setTransferModal(false)} />
      <AddMoneyModal isOpen={showAddMoneyModal} onClose={() => setAddMoneyModal(false)} />
    </ThemeProvider>
  );
}
