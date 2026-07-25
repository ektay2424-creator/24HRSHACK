import { Home, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'household' | 'target';

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home Profile', icon: Home },
  { id: 'household', label: 'Household Overlaps', icon: Users },
  { id: 'target', label: 'Tell Your Target', icon: Target },
];

export function TabNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="sticky top-[57px] z-30 border-b hairline bg-obsidian/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6">
        <div className="relative flex gap-1 overflow-x-auto scrollbar-thin">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={cn(
                  'group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon
                  size={16}
                  className={cn('transition-colors', isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400')}
                />
                {t.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
