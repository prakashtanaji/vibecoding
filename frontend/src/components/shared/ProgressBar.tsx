interface Props {
  value: number;   // 0-100
  size?: 'sm' | 'md';
  showLabel?: boolean;
  color?: string;
}

export function ProgressBar({ value, size = 'sm', showLabel = false, color }: Props) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const fill = color ?? (value >= 80 ? 'bg-emerald-500' : value >= 40 ? 'bg-brand-500' : 'bg-amber-400');

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ${fill}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{value}%</span>}
    </div>
  );
}
