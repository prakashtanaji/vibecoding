import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { api } from '../api/client';

export function useNotifications() {
  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const check = async () => {
      if (Notification.permission !== 'granted') return;

      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        const tasks = await api.getTasks({ date: today, status: 'todo' });
        const now = new Date();

        tasks.forEach((task: any) => {
          if (!task.due_time || notifiedRef.current.has(task.id)) return;

          const [h, m] = task.due_time.split(':').map(Number);
          const taskTime = new Date();
          taskTime.setHours(h, m, 0, 0);

          const diffMs = taskTime.getTime() - now.getTime();
          const diffMin = diffMs / 60_000;

          // Fire notification 15–16 minutes before
          if (diffMin >= 14 && diffMin <= 16) {
            notifiedRef.current.add(task.id);
            new Notification('📚 SDE Prep Reminder', {
              body: `"${task.title}" starts in ~15 minutes`,
              icon: '/favicon.ico',
              tag: `task-${task.id}`,
            });
          }
        });
      } catch {}
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);
}
