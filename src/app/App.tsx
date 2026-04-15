import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, CreditCard, ArrowUpRight, ArrowDownLeft, Vault } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { CardsPage } from './components/CardsPage';
import { VaultsPage } from './components/VaultsPage';
import { ProfilePage } from './components/ProfilePage';
import { SupportPage } from './components/SupportPage';
import { RemittancePage } from './components/RemittancePage';
import { ReceivePage } from './components/ReceivePage';
import { TransferModal } from './components/TransferModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { SplashScreen } from './components/SplashScreen';
import { PageSwipeTransition } from './components/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';

/* ─── nav tab definition ──────────────────────────────────── */
const TABS = [
  { id: 'bank',    icon: Landmark,       label: '银行'   },
  { id: 'cards',   icon: CreditCard,     label: '卡'     },
  { id: 'send',    icon: ArrowUpRight,   label: '汇款'   },
  { id: 'receive', icon: ArrowDownLeft,  label: '收款'   },
  { id: 'vaults',  icon: Vault,          label: '宝库'   },
];

/* ─── App ─────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab]             = useState('bank');
  const [showTransferModal, setTransferModal]  = useState(false);
  const [showAddMoneyModal, setAddMoneyModal]  = useState(false);
  const [showSplash, setShowSplash]            = useState(true);
  const [showProfile, setShowProfile]          = useState(false);
  const [showSupport, setShowSupport]          = useState(false);

  const renderPage = () => {
    if (showProfile) return <ProfilePage onBack={() => setShowProfile(false)} onViewWebsite={() => {}} />;
    if (showSupport) return <SupportPage onClose={() => setShowSupport(false)} />;
    switch (activeTab) {
      case 'bank':    return <HomePage onAddMoney={() => setAddMoneyModal(true)} onTransfer={() => setTransferModal(true)} onOpenProfile={() => setShowProfile(true)} onSupport={() => setShowSupport(true)} />;
      case 'cards':   return <CardsPage />;
      case 'send':    return <RemittancePage />;
      case 'receive': return <ReceivePage />;
      case 'vaults':  return <VaultsPage />;
      default:        return null;
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
        className="fixed inset-0 flex flex-col overflow-hidden"
        style={{ background: '#F2F2F7', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <PageSwipeTransition key={showProfile ? 'profile' : showSupport ? 'support' : activeTab}>
              {renderPage()}
            </PageSwipeTransition>
          </AnimatePresence>
        </div>

        {/* ── Floating Bottom Navigation ── */}
        <AnimatePresence>
          {showNav && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 3.1, duration: 0.4, type: 'spring', stiffness: 200 }}
              className="flex-shrink-0 px-3 pb-3"
              style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
            >
              <nav
                className="flex items-center justify-around rounded-[28px] bg-white px-2 h-[64px]"
                style={{
                  boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.84 }}
                      className="flex flex-col items-center gap-0.5 px-3 py-1 relative min-w-[52px]"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navActivePill"
                          className="absolute inset-x-0 inset-y-0 rounded-[20px] bg-neutral-100"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                      <tab.icon
                        className={`w-[18px] h-[18px] relative z-10 transition-colors duration-150 ${
                          isActive ? 'text-neutral-900' : 'text-neutral-400'
                        }`}
                        strokeWidth={isActive ? 2.4 : 1.7}
                      />
                      <span className={`text-[9px] font-semibold relative z-10 transition-colors duration-150 tracking-wide ${
                        isActive ? 'text-neutral-900' : 'text-neutral-400'
                      }`}>
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <TransferModal isOpen={showTransferModal} onClose={() => setTransferModal(false)} />
      <AddMoneyModal isOpen={showAddMoneyModal} onClose={() => setAddMoneyModal(false)} />
    </ThemeProvider>
  );
}
