import { useState } from 'react';
import { NavTab, SignalItem, SignalStatus, SignalLevel } from './types';
import { initialSignals, commanderDossier, activeUnit7, initialEncryptionLogs } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandCentralView } from './components/CommandCentralView';
import { DossierView } from './components/DossierView';
import { NetworkView } from './components/NetworkView';
import { TacticalCommandView } from './components/TacticalCommandView';
import { SolutionsView } from './components/SolutionsView';
import { SignalDetailModal } from './components/SignalDetailModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SpiderWebBackground } from './components/SpiderWebBackground';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('COMMAND_CENTRAL');
  const [signals, setSignals] = useState<SignalItem[]>(initialSignals);
  const [selectedSignal, setSelectedSignal] = useState<SignalItem | null>(null);
  const [dossier] = useState(commanderDossier);
  const [unit] = useState(activeUnit7);
  const [logs] = useState(initialEncryptionLogs);

  // System Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      time: '14:22 UTC',
      title: 'L1 CRITICAL SIGNAL',
      message: 'Unauthorized access attempt detected in Sector 7G.',
      type: 'CRITICAL' as const,
      read: false,
    },
    {
      id: 'n2',
      time: '14:15 UTC',
      title: 'NETWORK LATENCY',
      message: 'Sub-level comms repeater jitter registered +12ms.',
      type: 'WARN' as const,
      read: false,
    },
    {
      id: 'n3',
      time: '13:59 UTC',
      title: 'RECON UNIT DISPATCHED',
      message: 'Tactical Recon Unit 7 engaged on target vector Grid 44-B.',
      type: 'INFO' as const,
      read: true,
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleUpdateSignalStatus = (
    id: string,
    newStatus: SignalStatus,
    newLevel?: SignalLevel
  ) => {
    setSignals((prev) =>
      prev.map((sig) => {
        if (sig.id === id) {
          return {
            ...sig,
            status: newStatus,
            level: newLevel || sig.level,
          };
        }
        return sig;
      })
    );

    if (selectedSignal && selectedSignal.id === id) {
      setSelectedSignal((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              level: newLevel || prev.level,
            }
          : null
      );
    }
  };

  const handleDispatchUnit = (sector: string) => {
    // Add new notification
    const newNotif = {
      id: String(Date.now()),
      time: 'JUST NOW',
      title: 'UNIT DISPATCHED',
      message: `Tactical Recon Unit 7 redirected to ${sector}.`,
      type: 'INFO' as const,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleTriggerSOS = () => {
    setActiveTab('TACTICAL_COMMAND');
  };

  return (
    <div className="min-h-screen bg-[#13171B] text-[#f4dddd] flex flex-col justify-between tactical-grid-bg relative selection:bg-[#962333] selection:text-white overflow-x-hidden">
      {/* Spider Web Background Layer */}
      <SpiderWebBackground />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerSOS={handleTriggerSOS}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
      />

      {/* Main Content Render */}
      <main className="flex-1 w-full pb-12">
        {activeTab === 'COMMAND_CENTRAL' && (
          <CommandCentralView
            signals={signals}
            onSelectSignal={(signal) => setSelectedSignal(signal)}
          />
        )}

        {activeTab === 'DOSSIER' && (
          <DossierView
            dossier={dossier}
            onTriggerEmergency={(protocolName) => {
              const newNotif = {
                id: String(Date.now()),
                time: 'JUST NOW',
                title: 'EMERGENCY PROTOCOL ENGAGED',
                message: `Protocol "${protocolName}" triggered from Commander Dossier.`,
                type: 'CRITICAL' as const,
                read: false,
              };
              setNotifications((prev) => [newNotif, ...prev]);
              setShowNotifications(true);
            }}
          />
        )}

        {activeTab === 'NETWORK' && <NetworkView unit={unit} logs={logs} />}

        {activeTab === 'TACTICAL_COMMAND' && (
          <TacticalCommandView onBackToCentral={() => setActiveTab('COMMAND_CENTRAL')} />
        )}

        {activeTab === 'SOLUTIONS' && <SolutionsView onNavigate={(tab) => setActiveTab(tab)} />}
      </main>

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      )}

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <SignalDetailModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onUpdateStatus={handleUpdateSignalStatus}
          onDispatchUnit={handleDispatchUnit}
        />
      )}

      {/* Dark Tactical Footer */}
      <Footer />
    </div>
  );
}

export default App;
