import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wallet, CreditCard, Archive } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { CardsPage } from './components/CardsPage';
import { VaultsPage } from './components/VaultsPage';
import { ProfilePage } from './components/ProfilePage';
import { SupportPage } from './components/SupportPage';
import { TransferModal } from './components/TransferModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { SplashScreen } from './components/SplashScreen';
import { PageSwipeTransition } from './components/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';
import { CryptoPage } from './components/CryptoPage';

/* ─── nav tab definition ──────────────────────────────────── */
const TABS = [
  { id: 'home',   icon: Home,       label: 'Home'   },
  { id: 'crypto', icon: Wallet,     label: 'Crypto' },
  { id: 'cards',  icon: CreditCard, label: 'Cards'  },
  { id: 'vaults', icon: Archive,    label: 'Vaults' },
];

/* ─── App ─────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab]             = useState('home');
  const [showTransferModal, setTransferModal]  = useState(false);
  const [showAddMoneyModal, setAddMoneyModal]  = useState(false);
  const [showSplash, setShowSplash]            = useState(true);
  const [showProfile, setShowProfile]          = useState(false);
  const [showSupport, setShowSupport]          = useState(false);

  const renderPage = () => {
    if (showProfile) return <ProfilePage onBack={() => setShowProfile(false)} onViewWebsite={() => {}} />;
    if (showSupport) return <SupportPage onClose={() => setShowSupport(false)} />;
    switch (activeTab) {
      case 'home':   return <HomePage onAddMoney={() => setAddMoneyModal(true)} onTransfer={() => setTransferModal(true)} onOpenProfile={() => setShowProfile(true)} />;
      case 'crypto': return <CryptoPage />;
      case 'cards':  return <CardsPage />;
      case 'vaults': return <VaultsPage />;
      default:       return null;
    }
  };

  const showNav = !showProfile && !showSupport;

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
        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <PageSwipeTransition key={showProfile ? 'profile' : showSupport ? 'support' : activeTab}>
              {renderPage()}
            </PageSwipeTransition>
          </AnimatePresence>
        </div>

        {/* ── Bottom Navigation ── */}
        <AnimatePresence>
          {showNav && (
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 3.1, duration: 0.3 }}
              className="flex-shrink-0 bg-white"
              style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                borderTop: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-around px-3 h-16">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.88 }}
                      className="flex flex-col items-center gap-1 px-4 py-1 relative"
                    >
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
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <TransferModal isOpen={showTransferModal} onClose={() => setTransferModal(false)} />
      <AddMoneyModal isOpen={showAddMoneyModal} onClose={() => setAddMoneyModal(false)} />
    </ThemeProvider>
  );
}
