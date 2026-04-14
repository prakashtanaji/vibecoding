import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api } from '../../api/client';
import type { TrackType } from '../../types';

const TRACK_TYPES: { value: TrackType; label: string }[] = [
  { value: 'faang', label: 'FAANG / Big Tech' },
  { value: 'mid', label: 'Mid-tier' },
  { value: 'startup', label: 'Startup' },
];

const ICON_OPTIONS = [
  '🏢','🔵','🟠','🟣','🟡','🟤','⚫','🔶','🔷','🔸','🔹',
  '💡','🚀','💎','⚡','🌐','🎯','🏆','🛠️','🤖','🧠','🌟',
];

interface Props {
  defaultType?: TrackType;
  onClose: () => void;
}

export function AddCompanyModal({ defaultType = 'mid', onClose }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TrackType>(defaultType);
  const [icon, setIcon] = useState('🏢');
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: () => api.createTrack({ name, company: name, type, icon }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tracks'] }); onClose(); },
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) { setError('Company name is required'); return; }
    create.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Add Company Track</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company name *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Netflix, Shopify, Figma…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100
                placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Track category</label>
            <div className="flex gap-2">
              {TRACK_TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors
                    ${type === t.value
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map(emoji => (
                <button key={emoji} onClick={() => setIcon(emoji)}
                  className={`w-8 h-8 text-base rounded-lg flex items-center justify-center transition-colors
                    ${icon === emoji
                      ? 'bg-brand-100 dark:bg-brand-900/40 ring-2 ring-brand-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
            <span className="text-lg">{icon}</span>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{name || 'Company Name'}</p>
              <p className="text-xs text-slate-400">{TRACK_TYPES.find(t => t.value === type)?.label}</p>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!name.trim() || create.isPending}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white
              hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {create.isPending ? 'Adding…' : 'Add company'}
          </button>
        </div>
      </div>
    </div>
  );
}
