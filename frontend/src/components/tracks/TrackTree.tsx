import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';
import { ProgressBar } from '../shared/ProgressBar';
import { AddCompanyModal } from './AddCompanyModal';
import type { TrackType } from '../../types';

const TYPE_LABELS: Record<string, string> = { faang: 'FAANG', mid: 'Mid-tier', startup: 'Startup' };
const SEEDED_COMPANIES = new Set([
  'Google', 'Meta', 'Amazon', 'Microsoft',
  'Stripe', 'Airbnb', 'Uber', 'Startup General',
]);

export function TrackTree() {
  const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set([1]));
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [addingToType, setAddingToType] = useState<TrackType | null>(null);
  const { selectedTopicId, setSelectedTopicId, setSelectedTrackId, openNewTask } = useUIStore();
  const qc = useQueryClient();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => api.getTracks(),
    staleTime: 30_000,
  });

  const deleteTrack = useMutation({
    mutationFn: (id: number) => api.deleteTrack(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tracks'] }),
  });

  const toggleTrack = (id: number) =>
    setExpandedTracks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleTopic = (id: number) =>
    setExpandedTopics(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectTopic = (topicId: number, trackId: number) => {
    setSelectedTopicId(topicId);
    setSelectedTrackId(trackId);
  };

  const grouped = tracks.reduce((acc: Record<string, any[]>, t: any) => {
    (acc[t.type] = acc[t.type] ?? []).push(t);
    return acc;
  }, {});

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {(['faang', 'mid', 'startup'] as TrackType[]).map(type => {
          const typeTracks: any[] = grouped[type] ?? [];
          return (
            <div key={type} className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 group/header">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {TYPE_LABELS[type]}
                </span>
                <button
                  onClick={() => setAddingToType(type)}
                  className="opacity-0 group-hover/header:opacity-100 flex items-center gap-0.5
                    text-xs text-slate-400 hover:text-brand-500 dark:hover:text-brand-400
                    transition-all px-1 py-0.5 rounded"
                  title={`Add ${TYPE_LABELS[type]} company`}
                >
                  <Plus size={11} /><span>Add</span>
                </button>
              </div>

              {typeTracks.map(track => (
                <TrackNode
                  key={track.id}
                  track={track}
                  expanded={expandedTracks.has(track.id)}
                  onToggle={() => toggleTrack(track.id)}
                  expandedTopics={expandedTopics}
                  onToggleTopic={toggleTopic}
                  selectedTopicId={selectedTopicId}
                  onSelectTopic={(tid: number) => selectTopic(tid, track.id)}
                  onAddTask={openNewTask}
                  canDelete={!SEEDED_COMPANIES.has(track.name)}
                  onDelete={() => {
                    if (confirm(`Delete "${track.name}" and all its topics and tasks?`)) {
                      deleteTrack.mutate(track.id);
                    }
                  }}
                />
              ))}

              {typeTracks.length === 0 && (
                <button
                  onClick={() => setAddingToType(type)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-400 dark:text-slate-600
                    hover:text-brand-500 dark:hover:text-brand-400 italic"
                >
                  + Add your first {TYPE_LABELS[type]} company
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {addingToType && (
        <AddCompanyModal defaultType={addingToType} onClose={() => setAddingToType(null)} />
      )}
    </>
  );
}

function TrackNode({ track, expanded, onToggle, expandedTopics, onToggleTopic,
  selectedTopicId, onSelectTopic, onAddTask, canDelete, onDelete }: any) {
  return (
    <div className="group/track">
      <div className="flex items-center gap-1">
        <button onClick={onToggle}
          className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left min-w-0"
        >
          <span className="text-base flex-shrink-0">{track.icon}</span>
          <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{track.name}</span>
          {track.total_tasks > 0 && (
            <>
              <div className="w-12 flex-shrink-0"><ProgressBar value={track.progress ?? 0} size="sm" /></div>
              <span className="text-xs text-slate-400 w-7 text-right flex-shrink-0">{track.progress ?? 0}%</span>
            </>
          )}
          {expanded
            ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
            : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />}
        </button>

        {canDelete && (
          <button onClick={onDelete}
            className="opacity-0 group-hover/track:opacity-100 p-1 rounded hover:bg-red-100
              dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
            title="Delete track"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {expanded && track.topics?.map((topic: any) => (
        <TopicNode key={topic.id} topic={topic} depth={1}
          expandedTopics={expandedTopics} onToggle={onToggleTopic}
          selectedTopicId={selectedTopicId} onSelect={onSelectTopic} onAddTask={onAddTask}
        />
      ))}

      {expanded && (!track.topics || track.topics.length === 0) && (
        <p className="pl-8 py-1 text-xs text-slate-400 dark:text-slate-600 italic">
          No topics yet — add tasks directly
        </p>
      )}
    </div>
  );
}

function TopicNode({ topic, depth, expandedTopics, onToggle, selectedTopicId, onSelect, onAddTask }: any) {
  const hasChildren = topic.children?.length > 0;
  const expanded = expandedTopics.has(topic.id);
  const selected = selectedTopicId === topic.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm cursor-pointer transition-colors
          ${selected
            ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(topic.id)}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); onToggle(topic.id); }}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : <span className="w-3 flex-shrink-0" />}

        <span className="flex-1 truncate text-xs">{topic.name}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onAddTask(topic.id); }}
            className="p-0.5 rounded hover:bg-brand-200 dark:hover:bg-brand-800 text-brand-600 dark:text-brand-400"
            title="Add task">
            <Plus size={10} />
          </button>
        </div>

        {topic.total_tasks > 0 && (
          <span className="text-xs text-slate-400 flex-shrink-0">
            {topic.done_tasks}/{topic.total_tasks}
          </span>
        )}
      </div>

      {hasChildren && expanded && topic.children.map((child: any) => (
        <TopicNode key={child.id} topic={child} depth={depth + 1}
          expandedTopics={expandedTopics} onToggle={onToggle}
          selectedTopicId={selectedTopicId} onSelect={onSelect} onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}
