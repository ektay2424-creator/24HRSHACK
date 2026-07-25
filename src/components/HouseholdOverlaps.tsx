import { useEffect, useState } from 'react';
import { Sparkles, Loader2, Check, Layers, Wand2 } from 'lucide-react';
import { Badge, Panel } from './ui';
import { useToast } from './Toast';
import { familyOverlaps, type FamilyResult, type Overlap } from '@/lib/api';
import { cn, formatINR } from '@/lib/utils';

const SERVICE_LABEL: Record<string, { label: string; emoji: string }> = {
  Netflix: { label: 'Netflix', emoji: '\u{1F3AC}' },
  'Amazon Prime': { label: 'Amazon Prime', emoji: '\u{1F4E6}' },
  'Disney+ Hotstar': { label: 'Disney+ Hotstar', emoji: '\u{1F525}' },
};

export function HouseholdOverlaps({ connected }: { connected: boolean }) {
  const toast = useToast();
  const [data, setData] = useState<FamilyResult | null>(null);
  const [consolidating, setConsolidating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    familyOverlaps().then(({ data }) => setData(data));
  }, []);

  const handleConsolidate = async () => {
    setConsolidating(true);
    await familyOverlaps();
    setConsolidating(false);
    setDone(true);
    toast('Family subscriptions consolidated. Savings recalculated live.', 'success');
  };

  if (!data) return <SkeletonHouse />;

  return (
    <div className="space-y-6">
      {/* Family profiles header */}
      <div className="grid gap-3 sm:grid-cols-3">
        {data.members.map((m, i) => (
          <Panel key={m.name} hover className="flex items-center gap-3.5 p-4 animate-fade-in-up">
            <div style={{ animationDelay: `${i * 80}ms` }} className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-300">
                {m.avatar}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.count} subscriptions · {formatINR(m.monthly)}/mo
                </p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Central hero savings banner — muted mint for savings */}
      <Panel tone="mint" className="relative overflow-hidden p-6 text-center sm:p-8 animate-fade-in-up">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative">
          <Badge tone="mint" pulse className="mb-3">
            <Sparkles size={12} /> Household Optimization Impact
          </Badge>
          <p className="font-display text-4xl font-extrabold text-white sm:text-5xl">
            Save <span className="text-mint-gradient">{formatINR(data.monthlySaving)}</span>
            <span className="text-2xl font-bold text-slate-400">/month</span>
          </p>
          <p className="mt-2 text-base font-medium text-slate-400">
            That’s <span className="text-mint-gradient">{formatINR(data.yearlySaving)}/year</span> recovered
          </p>
          <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-xs text-slate-600">
            <Layers size={12} className="text-indigo-400" />
            {data.overlaps.length} duplicate overlaps detected across {data.members.length} members
          </div>
        </div>
      </Panel>

      {/* Duplicate overlap cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {data.overlaps.map((o, i) => (
          <OverlapCard key={o.service} overlap={o} delay={i * 100} />
        ))}
      </div>

      {/* Consolidate button — indigo primary */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleConsolidate}
          disabled={consolidating || done}
          className={cn(
            'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold transition-all',
            done
              ? 'border border-mint/30 bg-mint/10 text-mint-300'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          )}
        >
          {!done && (
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          )}
          {consolidating ? (
            <Loader2 size={17} className="animate-spin" />
          ) : done ? (
            <Check size={17} />
          ) : (
            <Wand2 size={17} />
          )}
          {done ? 'Consolidated — Savings Applied' : 'Consolidate Family Subscriptions'}
        </button>
      </div>

      {!connected && (
        <p className="text-center text-xs text-slate-600">
          Showing cached household data — backend not reachable. Consolidation still simulates live recalculation.
        </p>
      )}
    </div>
  );
}

function OverlapCard({ overlap, delay }: { overlap: Overlap; delay: number }) {
  const meta = SERVICE_LABEL[overlap.service] ?? { label: overlap.service, emoji: '\u{1F4B0}' };
  const total = overlap.members.reduce((s, m) => s + m.price, 0);
  return (
    <Panel hover className="p-5 animate-fade-in-up">
      <div style={{ animationDelay: `${delay}ms` }} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.03] text-lg border hairline">
              {meta.emoji}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{meta.label} Overlap</p>
              <p className="text-xs text-slate-500">{overlap.members.length} active plans · {formatINR(total)}/mo total</p>
            </div>
          </div>
          <Badge tone="rose" pulse>
            -{formatINR(overlap.saving)}/mo
          </Badge>
        </div>

        <div className="space-y-2">
          {overlap.members.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-lg border hairline bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-500/15 text-xs font-semibold text-indigo-300">
                  {m.name[0]}
                </span>
                <span className="text-sm text-slate-300">{m.name}</span>
                <span className="text-[11px] text-slate-600">· {m.plan}</span>
              </div>
              <span className="text-sm font-medium text-slate-300">{formatINR(m.price)}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-mint/20 bg-mint/[0.06] px-3 py-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-mint-300">
            <Sparkles size={11} /> Recommendation
          </div>
          <p className="text-sm text-slate-300">{overlap.recommendation}</p>
        </div>
      </div>
    </Panel>
  );
}

function SkeletonHouse() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[68px] animate-pulse rounded-xl panel" />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-xl panel" />
    </div>
  );
}
