import { Home } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { TrackTree } from '../tracks/TrackTree';

export function Sidebar() {
  const { sidebarCollapsed, selectedTopicId, setSelectedTopicId, setSelectedTrackId } = useUIStore();

  if (sidebarCollapsed) return null;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col flex-shrink-0">
      {/* Home / Today link */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => { setSelectedTopicId(null); setSelectedTrackId(null); }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${!selectedTopicId
              ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
        >
          <Home size={14} />
          Today's Tasks
        </button>
      </div>

      <div className="px-2 py-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          Tracks
        </div>
      </div>

      <TrackTree />
    </aside>
  );
}
