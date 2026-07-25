import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'indigo' | 'rose' | 'mint' | 'neutral';

export function Panel({
  children,
  className,
  raised = false,
  hover = false,
  tone,
}: {
  children: ReactNode;
  className?: string;
  raised?: boolean;
  hover?: boolean;
  tone?: Tone;
}) {
  const toneBorder =
    tone === 'rose'
      ? 'border-rose/30'
      : tone === 'mint'
      ? 'border-mint/30'
      : tone === 'indigo'
      ? 'border-indigo-500/30'
      : '';
  return (
    <div
      className={cn(
        'rounded-xl',
        raised ? 'panel-raised' : 'panel',
        tone && toneBorder,
        hover && 'panel-hover',
        className
      )}
    >
      {children}
    </div>
  );
}

const badgeTone: Record<Tone, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
  rose: 'bg-rose/10 text-rose-300 border-rose/25',
  mint: 'bg-mint/10 text-mint-300 border-mint/25',
  neutral: 'bg-white/[0.04] text-slate-400 border-hairline',
};

export function Badge({
  children,
  tone = 'neutral',
  pulse = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide',
        badgeTone[tone],
        pulse && tone === 'rose' && 'animate-pulse-ring',
        pulse && tone !== 'rose' && 'animate-pulse-soft',
        className
      )}
    >
      {children}
    </span>
  );
}

export function GlowOrb({ size = 36 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center rounded-full" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-indigo-500/20" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
      <div className="absolute inset-[3px] rounded-full bg-obsidian" />
      <div className="relative h-1.5 w-1.5 rounded-full bg-indigo-300 animate-pulse-soft" />
      <div className="absolute -inset-1 rounded-full border border-indigo-500/20 animate-spin-slow" />
    </div>
  );
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative h-5 w-9 rounded-full border transition-all duration-200',
        on ? 'bg-indigo-500/25 border-indigo-500/50' : 'bg-white/[0.04] border-hairline'
      )}
      aria-pressed={on}
    >
      <span
        className={cn(
          'absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-200',
          on ? 'left-4 bg-indigo-400' : 'left-0.5 bg-slate-500'
        )}
      />
    </button>
  );
}
