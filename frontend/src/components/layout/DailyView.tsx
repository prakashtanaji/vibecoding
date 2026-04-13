import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isToday } from 'date-fns';
import { Plus, BookOpen } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';
import { TaskCard } from '../tasks/TaskCard';
import { MiniCalendar } from '../calendar/MiniCalendar';
import { ResourceLinks } from '../shared/ResourceLinks';
import { ProgressBar } from '../shared/ProgressBar';

export function DailyView() {
  const { selectedDate, selectedTopicId, openNewTask } = useUIStore();

  const isCurrentTopicMode = !!selectedTopicId;

  // Tasks for selected date (when no topic selected)
  const tasksQueryKey = ['tasks', selectedDate];
  const { data: dailyTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: tasksQueryKey,
    queryFn: () => api.getTasks({ date: selectedDate }),
    enabled: !isCurrentTopicMode,
    staleTime: 10_000,
  });

  // Topic detail view
  const { data: topic } = useQuery({
    queryKey: ['topic', selectedTopicId],
    queryFn: () => api.getTopic(selectedTopicId!),
    enabled: isCurrentTopicMode,
    staleTime: 10_000,
  });

  const topicTasksKey = ['tasks', 'topic', selectedTopicId];
  const { data: topicTasks = [], isLoading: topicTasksLoading } = useQuery({
    queryKey: topicTasksKey,
    queryFn: () => api.getTasks({ topic_id: String(selectedTopicId) }),
    enabled: isCurrentTopicMode,
    staleTime: 10_000,
  });

  const dateLabel = isToday(parseISO(selectedDate)) ? 'Today' : format(parseISO(selectedDate), 'EEEE, MMM d');
  const tasks = isCurrentTopicMode ? topicTasks : dailyTasks;
  const queryKey = isCurrentTopicMode ? topicTasksKey : tasksQueryKey;
  const loading = isCurrentTopicMode ? topicTasksLoading : tasksLoading;

  const done = tasks.filter((t: any) => t.status === 'done').length;
  const total = tasks.length;

  return (
    <div className="flex gap-5 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {isCurrentTopicMode ? topic?.name ?? 'Topic' : dateLabel}
            </h1>
            {isCurrentTopicMode && topic?.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{topic.description}</p>
            )}
            {total > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {done} of {total} tasks done
              </p>
            )}
          </div>
          <button
            onClick={() => openNewTask(selectedTopicId)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
          >
            <Plus size={15} /> New task
          </button>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <ProgressBar value={total > 0 ? Math.round((done / total) * 100) : 0} size="md" showLabel />
        )}

        {/* Topic resources */}
        {isCurrentTopicMode && topic?.resources?.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Resources for this topic</span>
            </div>
            <ResourceLinks resources={topic.resources} />
          </div>
        )}

        {/* Tasks list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="text-xs mt-1">Click "New task" to add your first task</p>
            {!isCurrentTopicMode && (
              <p className="text-xs mt-1 text-slate-300 dark:text-slate-700">
                Or select a topic from the sidebar to see topic tasks
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto pb-4">
            {/* High priority first */}
            {['high', 'medium', 'low'].map(p => {
              const pTasks = tasks.filter((t: any) => t.priority === p);
              if (!pTasks.length) return null;
              return (
                <div key={p}>
                  {total > 3 && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600 mb-1.5 mt-3">
                      {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'} {p} priority
                    </div>
                  )}
                  <div className="space-y-2">
                    {pTasks.map((task: any) => (
                      <TaskCard key={task.id} task={task} queryKey={queryKey} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Mini Calendar */}
      {!isCurrentTopicMode && (
        <div className="w-64 flex-shrink-0 space-y-4">
          <MiniCalendar />
          <CalendarExportPanel />
        </div>
      )}
    </div>
  );
}

function CalendarExportPanel() {
  const { data: calStatus } = useQuery({
    queryKey: ['cal-status'],
    queryFn: () => api.calendarStatus(),
    staleTime: 300_000,
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
      <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Calendar</h3>
      <a
        href="http://localhost:3001/api/calendar/export.ics"
        download="sde-prep.ics"
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
      >
        📅 Export all tasks (.ics)
      </a>
      <a
        href="http://localhost:3001/api/calendar/daily-review.ics"
        download="sde-daily-review.ics"
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
      >
        🔔 Daily review events (.ics)
      </a>
      {calStatus?.configured && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Outlook connected</p>
      )}
      <a
        href="http://localhost:3001/api/backup"
        download="sde-prep-backup.json"
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
      >
        💾 Backup data (JSON)
      </a>
      {calStatus?.configured === false && (
        <p className="text-xs text-slate-400">Add OUTLOOK_CLIENT_ID to .env to enable Outlook sync</p>
      )}
    </div>
  );
}
