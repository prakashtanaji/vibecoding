import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Clock, Calendar, Trash2, Edit2, RotateCcw, CalendarCheck } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';
import { ResourceLinks } from '../shared/ResourceLinks';
import type { Task } from '../../types';

const PRIORITY_COLORS = {
  high: 'border-l-red-400 bg-red-50 dark:bg-red-900/10',
  medium: 'border-l-amber-400 bg-amber-50 dark:bg-amber-900/10',
  low: 'border-l-slate-300 bg-white dark:bg-slate-800',
};

const STATUS_BADGE = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface Props {
  task: Task;
  queryKey: unknown[];
}

export function TaskCard({ task, queryKey }: Props) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();
  const { openEditTask } = useUIStore();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey });
    qc.invalidateQueries({ queryKey: ['tracks'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };

  const toggleStatus = useMutation({
    mutationFn: () => {
      const next = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
      return api.updateTask(task.id, { status: next });
    },
    onSuccess: invalidate,
  });

  const deleteTask = useMutation({
    mutationFn: () => api.deleteTask(task.id),
    onSuccess: invalidate,
  });

  const syncToOutlook = useMutation({
    mutationFn: () => api.syncTask(task.id),
    onSuccess: invalidate,
  });

  const hasSubtasks = (task.subtasks?.length ?? 0) > 0;
  const doneSubs = task.subtasks?.filter(s => s.status === 'done').length ?? 0;
  const totalSubs = task.subtasks?.length ?? 0;

  return (
    <div className={`border-l-4 rounded-lg shadow-sm overflow-hidden transition-all ${PRIORITY_COLORS[task.priority]}`}>
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleStatus.mutate()}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
            ${task.status === 'done'
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : task.status === 'in_progress'
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-400'
            }`}
        >
          {task.status === 'done' && <span className="text-white text-xs leading-none">✓</span>}
          {task.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
              {task.title}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[task.status]}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>

          {task.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{task.notes}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {task.due_time && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} /> {task.due_time}
              </span>
            )}
            {task.recurrence_type !== 'none' && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <RotateCcw size={11} /> {task.recurrence_type}
              </span>
            )}
            {task.calendar_event_id && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <CalendarCheck size={11} /> Synced
              </span>
            )}
            {hasSubtasks && (
              <span className="text-xs text-slate-400">
                {doneSubs}/{totalSubs} subtasks
              </span>
            )}
          </div>

          {/* Resource links */}
          {task.resources && task.resources.length > 0 && (
            <ResourceLinks resources={task.resources} compact />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasSubtasks && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <button
            onClick={() => openEditTask(task.id)}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500"
          >
            <Edit2 size={13} />
          </button>
          {task.due_date && !task.calendar_event_id && (
            <button
              onClick={() => syncToOutlook.mutate()}
              disabled={syncToOutlook.isPending}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500"
              title="Sync to Outlook"
            >
              <Calendar size={13} />
            </button>
          )}
          <button
            onClick={() => { if (confirm('Delete this task?')) deleteTask.mutate(); }}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {expanded && hasSubtasks && (
        <div className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/50">
          {task.subtasks!.map(sub => (
            <SubtaskRow key={sub.id} subtask={sub} queryKey={queryKey} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubtaskRow({ subtask, queryKey }: { subtask: Task; queryKey: unknown[] }) {
  const qc = useQueryClient();

  const toggle = useMutation({
    mutationFn: () => api.updateTask(subtask.id, {
      status: subtask.status === 'done' ? 'todo' : 'done'
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ['tracks'] });
    },
  });

  return (
    <div className="flex items-center gap-3 px-3 py-2 pl-11">
      <button
        onClick={() => toggle.mutate()}
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
          ${subtask.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}
      >
        {subtask.status === 'done' && <span className="text-white text-[10px]">✓</span>}
      </button>
      <span className={`text-xs ${subtask.status === 'done' ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
        {subtask.title}
      </span>
    </div>
  );
}
