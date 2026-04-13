import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, PanelLeft, Code2 } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';

export function Header() {
  const { darkMode, toggleDarkMode, toggleSidebar } = useUIStore();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    refetchInterval: 60_000,
  });

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          title="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-brand-500" />
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">SDE Prep</span>
        </div>
      </div>

      {/* Center: today stats */}
      {stats && (
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Today: <strong className="text-slate-700 dark:text-slate-200">{stats.today.done}/{stats.today.total}</strong> tasks
          </span>
          <span className="hidden sm:block">
            Overall: <strong className="text-slate-700 dark:text-slate-200">{stats.overall.done}/{stats.overall.total}</strong> tasks
          </span>
          {stats.overall.total > 0 && (
            <span className="hidden md:flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">
                {Math.round((stats.overall.done / stats.overall.total) * 100)}%
              </span> complete
            </span>
          )}
        </div>
      )}

      {/* Right */}
      <button
        onClick={toggleDarkMode}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        title="Toggle dark mode"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
