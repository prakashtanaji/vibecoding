import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';
import { ProgressBar } from '../shared/ProgressBar';

export function TrackTree() {
  const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set([1]));
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const { selectedTopicId, setSelectedTopicId, setSelectedTrackId, openNewTask } = useUIStore();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => api.getTracks(),
    staleTime: 30_000,
  });

  const toggleTrack = (id: number) =>
    setExpandedTracks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleTopic = (id: number) =>
    setExpandedTopics(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectTopic = (topicId: number, trackId: number) => {
    setSelectedTopicId(topicId);
    setSelectedTrackId(trackId);
  };

  const typeLabel: Record<string, string> = { faang: 'FAANG', mid: 'Mid-tier', startup: 'Startup' };
  const grouped = tracks.reduce((acc: any, t: any) => {
    (acc[t.type] = acc[t.type] ?? []).push(t);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
      {Object.entries(grouped).map(([type, typeTracks]) => (
        <div key={type} className="mb-4">
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {typeLabel[type] ?? type}
          </div>
          {(typeTracks as any[]).map((track: any) => (
            <TrackNode
              key={track.id}
              track={track}
              expanded={expandedTracks.has(track.id)}
              onToggle={() => toggleTrack(track.id)}
              expandedTopics={expandedTopics}
              onToggleTopic={toggleTopic}
              selectedTopicId={selectedTopicId}
              onSelectTopic={(tid) => selectTopic(tid, track.id)}
              onAddTask={openNewTask}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

function TrackNode({ track, expanded, onToggle, expandedTopics, onToggleTopic, selectedTopicId, onSelectTopic, onAddTask }: any) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <span className="text-base">{track.icon}</span>
        <span className="flex-1 truncate">{track.name}</span>
        <ProgressBar value={track.progress ?? 0} size="sm" />
        <span className="text-xs text-slate-400 w-8 text-right">{track.progress ?? 0}%</span>
        {expanded ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />}
      </button>

      {expanded && track.topics?.map((topic: any) => (
        <TopicNode
          key={topic.id}
          topic={topic}
          depth={1}
          expandedTopics={expandedTopics}
          onToggle={onToggleTopic}
          selectedTopicId={selectedTopicId}
          onSelect={onSelectTopic}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}

function TopicNode({ topic, depth, expandedTopics, onToggle, selectedTopicId, onSelect, onAddTask }: any) {
  const hasChildren = topic.children?.length > 0;
  const expanded = expandedTopics.has(topic.id);
  const selected = selectedTopicId === topic.id;
  const indent = `pl-${Math.min(depth * 4, 12)}`;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm cursor-pointer
          transition-colors ${indent}
          ${selected
            ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(topic.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(topic.id); }}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        )}
        {!hasChildren && <span className="w-3 flex-shrink-0" />}

        <span className="flex-1 truncate text-xs">{topic.name}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onAddTask(topic.id); }}
            className="p-0.5 rounded hover:bg-brand-200 dark:hover:bg-brand-800 text-brand-600 dark:text-brand-400"
            title="Add task"
          >
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
        <TopicNode
          key={child.id}
          topic={child}
          depth={depth + 1}
          expandedTopics={expandedTopics}
          onToggle={onToggle}
          selectedTopicId={selectedTopicId}
          onSelect={onSelect}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}
