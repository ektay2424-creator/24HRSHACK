import { useState } from 'react';
import { ChevronDown, Activity, Zap } from 'lucide-react';
import { Badge, GlowOrb } from './ui';
import { cn } from '@/lib/utils';

export function Header({ connected }: { connected: boolean }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState('Aditya');

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-obsidian/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <GlowOrb size={36} />
          <div className="leading-tight">
            <h1 className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
              Route<span className="text-indigo-gradient">Wise</span>
            </h1>
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-slate-600 sm:block">
              Financial Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge tone={connected ? 'mint' : 'neutral'} pulse className="hidden sm:inline-flex">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                connected ? 'bg-mint-400 animate-pulse-soft' : 'bg-amber-400'
              )}
            />
            {connected ? 'Backend Connected' : 'Connecting…'}
          </Badge>

          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border hairline bg-panel px-2 py-1.5 transition panel-hover"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-indigo-500/15 text-xs font-bold text-indigo-300">
                {user[0]}
              </span>
              <span className="hidden text-sm font-medium text-slate-200 sm:block">{user}</span>
              <ChevronDown size={14} className={cn('text-slate-500 transition', open && 'rotate-180')} />
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-44 animate-fade-in-up panel-raised rounded-lg p-1 shadow-xl">
                  {['Aditya', 'Mom', 'Dad'].map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setUser(name);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition',
                        user === name ? 'bg-indigo-500/10 text-white' : 'text-slate-300 hover:bg-white/[0.04]'
                      )}
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-500/15 text-xs font-semibold text-indigo-300">
                        {name[0]}
                      </span>
                      {name}
                      {user === name && <Zap size={12} className="ml-auto text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
