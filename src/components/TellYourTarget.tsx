import { useEffect, useMemo, useState, useCallback } from 'react';
import { Target, Loader2, Sparkles, Rocket, CheckCircle2, TrendingDown, RefreshCw } from 'lucide-react';
import { Badge, Panel } from './ui';
import { useToast } from './Toast';
import { calculateGoal, familyOverlaps, type GoalResult } from '@/lib/api';
import { cn, formatINR } from '@/lib/utils';

export function TellYourTarget({ connected }: { connected: boolean }) {
  const toast = useToast();

  // Editable fields – start empty so the user chooses both object and price
  const [targetName, setTargetName] = useState('');
  const [costInput, setCostInput] = useState('');

  // Monthly saving from the backend (family overlaps)
  const [monthlySaving, setMonthlySaving] = useState(1713);
  const [savingLoaded, setSavingLoaded] = useState(false);

  // Goal state
  const [goal, setGoal] = useState<GoalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatePct, setAnimatePct] = useState(0);

  // Fetch the real monthly saving
  useEffect(() => {
    const fetchSaving = async () => {
      try {
        const data = await familyOverlaps();
        setMonthlySaving(data.monthlySaving);
      } catch {
        // keep default 1713
      } finally {
        setSavingLoaded(true);
      }
    };
    fetchSaving();
  }, []);

  // Recompute goal (called only on manual submit)
  const recompute = useCallback(
    async (name: string, cost: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await calculateGoal(name, cost, monthlySaving);
        setGoal(data);
        const finalPct = data.timeline.length ? data.timeline[data.timeline.length - 1].pct : 0;
        setTimeout(() => setAnimatePct(finalPct), 120);
        toast('Goal timeline recalculated with live backend.', 'info');
      } catch (err) {
        setError('Failed to calculate goal. Please check if the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [monthlySaving, toast]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = targetName.trim();
    if (!name) {
      toast('Please enter a target item name.', 'info');
      return;
    }
    const cost = Math.max(1, Number(costInput) || 0);
    recompute(name, cost);
  };

  const stepsSorted = useMemo(
    () => (goal ? [...goal.steps].sort((a, b) => b.amount - a.amount) : []),
    [goal]
  );

  // Show loading spinner until saving is loaded
  if (!savingLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel tone="rose" className="p-6 text-center">
        <p className="text-rose-300">{error}</p>
        <button
          onClick={() => recompute(targetName, Number(costInput) || 6000)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </Panel>
    );
  }

  if (!goal) {
    // initial state – show the form only, no projection yet
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <Panel tone="indigo" className="p-5 sm:p-6 lg:col-span-2 animate-fade-in-up">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Target size={16} />
              </div>
              <h3 className="font-display text-sm font-bold text-white">Set Your Purchase Goal</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Target Purchase Item
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Nike Shoes"
                  className="focus-ring w-full rounded-lg border hairline bg-panel px-4 py-2.5 text-sm font-medium text-white placeholder-slate-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Target Cost (₹)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                    ₹
                  </span>
                  <input
                    inputMode="numeric"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="6000"
                    className="focus-ring w-full rounded-lg border hairline bg-panel py-2.5 pl-8 pr-4 text-sm font-medium text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="rounded-lg border hairline bg-white/[0.02] p-3 text-xs text-slate-500">
                Redirecting <span className="font-semibold text-mint-400">{formatINR(monthlySaving)}/mo</span> from family
                duplicate cancellations toward this goal.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {loading ? 'Calculating…' : 'Project Timeline'}
              </button>
            </form>
          </Panel>
          <div className="lg:col-span-3">
            <Panel className="p-6 text-center text-sm text-slate-400">
              Enter a target item and cost, then click “Project Timeline” to see your AI‑powered savings plan.
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input card */}
        <Panel tone="indigo" className="p-5 sm:p-6 lg:col-span-2 animate-fade-in-up">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
              <Target size={16} />
            </div>
            <h3 className="font-display text-sm font-bold text-white">Set Your Purchase Goal</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Target Purchase Item
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Nike Shoes"
                className="focus-ring w-full rounded-lg border hairline bg-panel px-4 py-2.5 text-sm font-medium text-white placeholder-slate-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Target Cost (₹)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                  ₹
                </span>
                <input
                  inputMode="numeric"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6000"
                  className="focus-ring w-full rounded-lg border hairline bg-panel py-2.5 pl-8 pr-4 text-sm font-medium text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div className="rounded-lg border hairline bg-white/[0.02] p-3 text-xs text-slate-500">
              Redirecting <span className="font-semibold text-mint-400">{formatINR(monthlySaving)}/mo</span> from family
              duplicate cancellations toward this goal.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {loading ? 'Calculating…' : 'Project Timeline'}
            </button>
          </form>
        </Panel>

        {/* Timeline projection result */}
        <div className="lg:col-span-3 space-y-4">
          <Panel tone="mint" className="relative overflow-hidden p-6 sm:p-7 animate-fade-in-up">
            <div className="relative">
              <Badge tone="mint" pulse className="mb-3">
                <Rocket size={12} /> AI Timeline Projection
              </Badge>
              <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                Afford your <span className="text-indigo-gradient">{goal.targetName}</span> in just{' '}
                <span className="text-mint-gradient">{goal.months} month{goal.months > 1 ? 's' : ''}!</span>
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                By redirecting <span className="font-semibold text-mint-400">{formatINR(goal.monthlySaving)}/mo</span> saved
                from family duplicate cancellations toward your {formatINR(goal.targetCost)} goal.
              </p>
            </div>
          </Panel>

          {/* Progress cascade bar */}
          <Panel className="p-5 sm:p-6 animate-fade-in-up">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-white">Savings Cascade</h3>
              <span className="text-xs font-medium text-slate-500">
                {formatINR(goal.timeline[goal.timeline.length - 1]?.saved ?? 0)} / {formatINR(goal.targetCost)}
              </span>
            </div>

            <div className="relative h-4 w-full overflow-hidden rounded-full border hairline bg-white/[0.03]">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
                style={{ width: `${animatePct}%` }}
              />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.5s linear infinite',
                }}
              />
            </div>

            {/* month markers */}
            <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${goal.timeline.length}, minmax(0, 1fr))` }}>
              {goal.timeline.map((t) => (
                <div key={t.month} className="text-center">
                  <div
                    className={cn(
                      'mx-auto mb-1 h-1.5 w-1.5 rounded-full transition-all',
                      animatePct >= t.pct ? 'bg-indigo-400' : 'bg-white/15'
                    )}
                  />
                  <p className="text-[10px] font-medium text-slate-500">M{t.month}</p>
                  <p className="text-[10px] text-slate-600">{t.pct}%</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Steps list */}
      <Panel className="p-5 sm:p-6 animate-fade-in-up">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-white">Step-by-Step Recommendation</h3>
          <span className="text-xs text-slate-600">Sorted by highest impact</span>
        </div>
        <div className="space-y-2.5">
          {stepsSorted.map((s, i) => {
            const cumulative = stepsSorted.slice(0, i + 1).reduce((sum, x) => sum + x.amount, 0);
            const pct = Math.min(100, Math.round((cumulative / monthlySaving) * 100));
            return (
              <div
                key={s.label}
                className="group relative flex items-center gap-4 rounded-lg border hairline bg-white/[0.02] px-4 py-3 transition hover:border-indigo-500/30 hover:bg-white/[0.04] animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-indigo-500/15 text-xs font-bold text-indigo-300">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">{s.label}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-mint-400">+{formatINR(s.amount)}</p>
                  <p className="text-[10px] text-slate-600">/mo saved</p>
                </div>
                <TrendingDown size={15} className="text-mint-400/70 transition group-hover:scale-110" />
              </div>
            );
          })}
          <div className="mt-2 flex items-center justify-between rounded-lg border border-mint/20 bg-mint/[0.06] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-mint-300">
              <CheckCircle2 size={15} /> Total monthly recovery
            </div>
            <span className="font-display text-lg font-extrabold text-mint-gradient">
              {formatINR(monthlySaving)}/mo
            </span>
          </div>
        </div>
      </Panel>

      {!connected && (
        <p className="text-center text-xs text-slate-600">
          Backend at localhost:4000 not reachable – showing cached data if available.
        </p>
      )}
    </div>
  );
}