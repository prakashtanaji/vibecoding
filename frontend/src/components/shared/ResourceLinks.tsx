import { ExternalLink } from 'lucide-react';
import type { Resource } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  video: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  practice: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  course: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

interface Props {
  resources: Resource[];
  compact?: boolean;
}

export function ResourceLinks({ resources, compact = false }: Props) {
  if (!resources?.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? '' : 'mt-2'}`}>
      {resources.map(r => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            transition-opacity hover:opacity-80 ${TYPE_COLORS[r.type] ?? TYPE_COLORS.article}`}
          title={r.url}
        >
          <ExternalLink size={10} />
          {r.title}
        </a>
      ))}
    </div>
  );
}
