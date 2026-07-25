import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { TabNav, type TabId } from '@/components/TabNav';
import { HomeProfile } from '@/components/HomeProfile';
import { HouseholdOverlaps } from '@/components/HouseholdOverlaps';
import { TellYourTarget } from '@/components/TellYourTarget';
import { ToastProvider } from '@/components/Toast';
import { detectSubscriptions } from '@/lib/api';

function App() {
  const [tab, setTab] = useState<TabId>('home');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      const { live } = await detectSubscriptions();
      if (mounted) setConnected(live);
    };
    probe();
    const id = setInterval(probe, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <ToastProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-obsidian">
        {/* faint grid overlay only */}
        <div className="pointer-events-none fixed inset-0 grid-overlay opacity-[0.12]" />

        <div className="relative z-10">
          <Header connected={connected} />
          <TabNav active={tab} onChange={setTab} />

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <div key={tab} className="animate-fade-in-up">
              {tab === 'home' && <HomeProfile connected={connected} />}
              {tab === 'household' && <HouseholdOverlaps connected={connected} />}
              {tab === 'target' && <TellYourTarget connected={connected} />}
            </div>
          </main>

          <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6 text-center text-xs text-slate-700 sm:px-6">
            RouteWise · Financial Dashboard
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
