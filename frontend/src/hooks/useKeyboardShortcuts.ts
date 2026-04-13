import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';

export function useKeyboardShortcuts() {
  const { openNewTask, selectedTopicId, taskFormOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (taskFormOpen) return;

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openNewTask(selectedTopicId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openNewTask, selectedTopicId, taskFormOpen]);
}
