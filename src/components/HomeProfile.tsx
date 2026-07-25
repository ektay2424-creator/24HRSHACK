import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ShieldOff,
  PhoneCall,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Volume2,
  Loader2,
} from 'lucide-react';
import { Badge, Panel, Toggle } from './ui';
import { useToast } from './Toast';
import { detectSubscriptions, narrateInsights, triggerVoiceCall, type DetectionResult, type NarrationResult, type Subscription } from '@/lib/api';
import { cn, formatINR } from '@/lib/utils';

const SERVICE_ICONS: Record<string, string> = {
  Netflix: '\u{1F3AC}',
  Spotify: '\u{1F3B5}',
  'Adobe Creative Cloud': '\u{1F3A8}',
  'YouTube Premium': '\u{1F534}',
};

export function HomeProfile({ connected }: { connected: boolean }) {
  const toast = useToast();
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [narration, setNarration] = useState<NarrationResult | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loadingNarrate, setLoadingNarrate] = useState(false);
  const [calling, setCalling] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [confirmAutopay, setConfirmAutopay] = useState(false);

  useEffect(() => {
    detectSubscriptions().then(({ data }) => {
      setDetection(data);
      setSubs(data.subscriptions);
    });
    narrateInsights().then(({ data }) => setNarration(data));
  }, []);

  const hike = detection?.hikeAlert;

  const handleAutopay = () => setConfirmAutopay(true);
  const confirmAutopayDisable = () => {
    setConfirmAutopay(false);
    toast('Auto-Pay disabled for Adobe Creative Cloud. Future charges blocked.', 'success');
  };

  const handleVoiceCall = async () => {
    setCalling(true);
    const msg = `Alert. Stealth price hike detected on ${hike?.name ?? 'Adobe Creative Cloud'}. It surged from ${hike?.oldPrice ?? 1600} to ${hike?.newPrice ?? 4293} rupees per month, a ${hike?.increasePct ?? 168} percent increase. Auto-pay has been flagged for review.`;
    const { data, live } = await triggerVoiceCall('aditya', msg);
    setCalling(false);
    if (live) toast('AI voice call dispatched to your phone.', 'success');
    else toast('Voice call queued (demo mode — using browser speech).', 'info');
    speak(msg);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /en-IN|en-GB|en-US/i.test(v.lang));
    if (preferred) u.voice = preferred;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleNarrate = async () => {
    setLoadingNarrate(true);
    const { data, live } = await narrateInsights();
    setLoadingNarrate(false);
    setNarration(data);
    toast(live ? 'Fresh Gemini insights generated.' : 'Insights refreshed (cached narrative).', 'info');
  };

  const toggleSub = (id: string) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, tag: s.tag === 'Keep' ? 'Review' : 'Keep' } : s)));
  };

  return (
    <div className="space-y-6">
      {/* Hero alert banner — rose reserved strictly for price-hike alert */}
      {hike && (
        <Panel tone="rose" className="relative overflow-hidden p-5 sm:p-6 animate-fade-in-up">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-rose/10 text-rose-300">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="rose" pulse>
                    <ShieldOff size={12} /> Stealth Price Hike Detected
                  </Badge>
                  <Badge tone="neutral">Auto-Pay Active</Badge>
                </div>
                <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
                  <span className="text-rose-gradient">{hike.name}</span> surged{' '}
                  <span className="text-rose-gradient">+{hike.increasePct}%</span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Quietly raised from{' '}
                  <span className="font-medium text-slate-300 line-through decoration-rose/50">
                    {formatINR(hike.oldPrice)}
                  </span>{' '}
                  <ArrowUpRight size={13} className="inline text-rose-300" />{' '}
                  <span className="font-semibold text-rose-300">{formatINR(hike.newPrice)}/mo</span>
                  <span className="ml-2 text-slate-500">
                    Extra {formatINR(hike.newPrice - hike.oldPrice)}/mo drained
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAutopay}
                className="inline-flex items-center gap-2 rounded-lg border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose/15"
              >
                <ShieldOff size={15} /> Disable Auto-Pay
              </button>
              <button
                onClick={handleVoiceCall}
                disabled={calling}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >
                {calling ? <Loader2 size={15} className="animate-spin" /> : <PhoneCall size={15} />}
                {calling ? 'Calling…' : 'Trigger AI Voice Call Alert'}
              </button>
            </div>
          </div>

          {(speaking || calling) && <AudioVisualizer speaking={speaking} />}
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Subscriptions feed */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display text-sm font-bold text-white">Active Subscriptions</h3>
            <span className="text-xs text-slate-600">{subs.length} services tracked</span>
          </div>
          <div className="space-y-3">
            {subs.map((s, i) => (
              <Panel
                key={s.id}
                hover
                tone={s.tag === 'Review' ? 'rose' : undefined}
                className="p-4 animate-fade-in-up"
              >
                <div className="flex items-center gap-4" style={{ animationDelay: `${i * 70}ms` }}>
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg border',
                      s.tag === 'Review' ? 'bg-rose/5 border-rose/20' : 'bg-white/[0.03] border-hairline'
                    )}
                  >
                    {SERVICE_ICONS[s.name] ?? '\u{1F4B0}'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">{s.name}</p>
                      {s.oldPrice && (
                        <Badge tone="rose" className="hidden sm:inline-flex">
                          <TrendingUp size={10} /> Hiked
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {s.plan} · {s.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', s.oldPrice ? 'text-rose-300' : 'text-slate-200')}>
                      {formatINR(s.price)}
                      <span className="text-xs font-normal text-slate-600">/mo</span>
                    </p>
                    {s.oldPrice && (
                      <p className="text-[11px] text-slate-600 line-through">{formatINR(s.oldPrice)}</p>
                    )}
                  </div>
                  <Badge tone={s.tag === 'Review' ? 'rose' : 'mint'}>{s.tag}</Badge>
                  <Toggle on={s.tag === 'Keep'} onToggle={() => toggleSub(s.id)} />
                </div>
              </Panel>
            ))}
          </div>
        </div>

        {/* AI Narrator */}
        <div className="lg:col-span-2">
          <div className="px-1">
            <h3 className="font-display text-sm font-bold text-white">AI Narrator</h3>
          </div>
          <Panel tone="indigo" className="mt-3 p-5 animate-fade-in-up">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                  <Sparkles size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Gemini Insight</p>
                  <p className="text-[11px] text-slate-600">Generated narrative</p>
                </div>
              </div>
              <button
                onClick={handleNarrate}
                disabled={loadingNarrate}
                className="inline-flex items-center gap-1.5 rounded-md border hairline bg-panel px-2.5 py-1.5 text-xs font-medium text-slate-300 transition panel-hover hover:text-white disabled:opacity-60"
              >
                {loadingNarrate ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Refresh
              </button>
            </div>

            {narration ? (
              <div className="space-y-4">
                <div className="rounded-lg border hairline bg-white/[0.02] p-3.5">
                  <p className="text-sm leading-relaxed text-slate-300">
                    <span className="mr-1 text-indigo-400">“</span>
                    {narration.summary}
                    <span className="ml-1 text-indigo-400">”</span>
                  </p>
                </div>
                <ul className="space-y-2">
                  {narration.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-slate-400 animate-fade-in-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => speak(narration.summary)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  <Volume2 size={13} /> Play narration
                </button>
              </div>
            ) : (
              <SkeletonNarrator />
            )}
          </Panel>
        </div>
      </div>

      {confirmAutopay && (
        <ConfirmModal
          title="Disable Auto-Pay for Adobe?"
          body="This stops all future automatic charges to your card. You can re-enable anytime from your bank mandates."
          onCancel={() => setConfirmAutopay(false)}
          onConfirm={confirmAutopayDisable}
        />
      )}

      {!connected && (
        <p className="text-center text-xs text-slate-600">
          Showing cached data — backend at localhost:4000 not reachable. All actions still work in demo mode.
        </p>
      )}
    </div>
  );
}

function AudioVisualizer({ speaking }: { speaking: boolean }) {
  const bars = 18;
  return (
    <div className="mt-5 flex h-14 items-end justify-center gap-1 rounded-lg border hairline bg-white/[0.02] p-3">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-1.5 rounded-full bg-indigo-400/80',
            speaking ? 'animate-equalizer' : 'opacity-30'
          )}
          style={{
            height: speaking ? `${18 + Math.abs(Math.sin(i * 0.7)) * 24}px` : '6px',
            animationDelay: `${i * 55}ms`,
            animationDuration: `${600 + (i % 4) * 110}ms`,
          }}
        />
      ))}
    </div>
  );
}

function SkeletonNarrator() {
  return (
    <div className="space-y-3">
      <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.06]" />
      <div className="h-3 w-4/6 animate-pulse rounded bg-white/[0.06]" />
    </div>
  );
}

export function ConfirmModal({
  title,
  body,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-obsidian/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm animate-fade-in-up panel-raised rounded-xl p-6 shadow-2xl">
        <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-lg border hairline bg-panel px-4 py-2 text-sm font-medium text-slate-300 transition panel-hover"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg border border-rose/30 bg-rose/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose/20"
          >
            Confirm Disable
          </button>
        </div>
      </div>
    </div>
  );
}
