import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';
import type { CreateTaskPayload, Priority, RecurrenceType, TaskStatus } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TaskForm() {
  const { taskFormOpen, editingTaskId, taskFormTopicId, closeTaskForm, selectedDate } = useUIStore();
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [topicId, setTopicId] = useState<number | null>(taskFormTopicId);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(['']);

  const { data: tracks = [] } = useQuery({ queryKey: ['tracks'], queryFn: () => api.getTracks() });

  const { data: existingTask } = useQuery({
    queryKey: ['task', editingTaskId],
    queryFn: () => api.getTask(editingTaskId!),
    enabled: !!editingTaskId,
  });

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title ?? '');
      setNotes(existingTask.notes ?? '');
      setDueDate(existingTask.due_date ?? selectedDate);
      setDueTime(existingTask.due_time ?? '');
      setPriority(existingTask.priority ?? 'medium');
      setStatus(existingTask.status ?? 'todo');
      setTopicId(existingTask.topic_id ?? null);
      setRecurrence(existingTask.recurrence_type ?? 'none');
      setRecurrenceDays(existingTask.recurrence_days ?? []);
      setRecurrenceEnd(existingTask.recurrence_end_date ?? '');
      setSubtasks(existingTask.subtasks?.map((s: any) => s.title) ?? ['']);
    } else if (!editingTaskId) {
      setTitle(''); setNotes(''); setDueDate(selectedDate); setDueTime('');
      setPriority('medium'); setStatus('todo');
      setTopicId(taskFormTopicId ?? null);
      setRecurrence('none'); setRecurrenceDays([]); setRecurrenceEnd('');
      setSubtasks(['']);
    }
  }, [existingTask, editingTaskId, taskFormTopicId, selectedDate]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
    qc.invalidateQueries({ queryKey: ['tracks'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
    qc.invalidateQueries({ queryKey: ['calendar-dates'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: CreateTaskPayload = {
        title, notes, due_date: dueDate || null, due_time: dueTime || null,
        priority, status, topic_id: topicId, recurrence_type: recurrence,
        recurrence_days: recurrence === 'custom' ? recurrenceDays : null,
        recurrence_end_date: recurrence !== 'none' && recurrenceEnd ? recurrenceEnd : null,
      };

      let taskId: number;
      if (editingTaskId) {
        await api.updateTask(editingTaskId, payload);
        taskId = editingTaskId;
      } else {
        const res = await api.createTask(payload);
        taskId = res.id;
      }

      // Create subtasks
      if (!editingTaskId) {
        const validSubs = subtasks.filter(s => s.trim());
        for (const sub of validSubs) {
          await api.createTask({ title: sub, parent_task_id: taskId, status: 'todo', priority: 'medium' });
        }
      }
    },
    onSuccess: () => { invalidate(); closeTaskForm(); },
  });

  if (!taskFormOpen) return null;

  // Flatten tracks → topics for select
  const topicOptions: { id: number; label: string }[] = [];
  tracks.forEach((track: any) => {
    const flatTopics = (topics: any[], prefix = '') => {
      topics.forEach(t => {
        topicOptions.push({ id: t.id, label: `${track.icon} ${prefix}${t.name}` });
        if (t.children?.length) flatTopics(t.children, `${t.name} › `);
      });
    };
    flatTopics(track.topics ?? []);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {editingTaskId ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={closeTaskForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Task title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Study Dynamic Programming patterns"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional context, links, or reminders..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Topic</label>
            <select
              value={topicId ?? ''}
              onChange={e => setTopicId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">No topic</option>
              {topicOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                  text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Time (optional)</label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                  text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                  text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800 dark:text-slate-100"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                  text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800 dark:text-slate-100"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Recurrence</label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-800 dark:text-slate-100"
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom days</option>
            </select>

            {recurrence === 'custom' && (
              <div className="flex gap-1.5 mt-2">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setRecurrenceDays(prev =>
                      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                    )}
                    className={`flex-1 py-1 text-xs rounded ${recurrenceDays.includes(i)
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                  >
                    {d.slice(0, 1)}
                  </button>
                ))}
              </div>
            )}

            {recurrence !== 'none' && (
              <div className="mt-2">
                <label className="block text-xs text-slate-500 mb-1">End date (optional)</label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  onChange={e => setRecurrenceEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                    text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            )}
          </div>

          {/* Subtasks (new task only) */}
          {!editingTaskId && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subtasks</label>
              <div className="space-y-2">
                {subtasks.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={sub}
                      onChange={e => setSubtasks(prev => prev.map((s, j) => j === i ? e.target.value : s))}
                      placeholder={`Subtask ${i + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700
                        text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    {subtasks.length > 1 && (
                      <button
                        onClick={() => setSubtasks(prev => prev.filter((_, j) => j !== i))}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setSubtasks(prev => [...prev, ''])}
                  className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Plus size={12} /> Add subtask
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={closeTaskForm}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={!title.trim() || save.isPending}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {save.isPending ? 'Saving…' : editingTaskId ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}
