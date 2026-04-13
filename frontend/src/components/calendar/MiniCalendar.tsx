import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';

export function MiniCalendar() {
  const { selectedDate, setSelectedDate } = useUIStore();
  const [viewMonth, setViewMonth] = useState(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const from = format(calStart, 'yyyy-MM-dd');
  const to = format(calEnd, 'yyyy-MM-dd');

  const { data: taskDates = [] } = useQuery({
    queryKey: ['calendar-dates', from, to],
    queryFn: () => api.getCalendarDates(from, to),
    staleTime: 60_000,
  });

  const taskDateMap = new Map<string, { count: number; done: number }>(
    taskDates.map((d: any) => [d.due_date, { count: d.count, done: d.done }])
  );

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {format(viewMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(day => {
          const ds = format(day, 'yyyy-MM-dd');
          const isToday = ds === today;
          const isSelected = ds === selectedDate;
          const isOtherMonth = !isSameMonth(day, viewMonth);
          const taskInfo = taskDateMap.get(ds);
          const allDone = taskInfo && taskInfo.done >= taskInfo.count;

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(ds)}
              className={`
                relative flex flex-col items-center justify-center p-1 rounded-lg text-xs transition-colors
                ${isSelected ? 'bg-brand-500 text-white' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-brand-400 font-semibold' : ''}
                ${isOtherMonth && !isSelected ? 'text-slate-300 dark:text-slate-600' : ''}
                ${!isSelected && !isOtherMonth ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200' : ''}
              `}
            >
              <span className="leading-none">{format(day, 'd')}</span>
              {taskInfo && (
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${allDone ? 'bg-emerald-400' : isSelected ? 'bg-white/70' : 'bg-brand-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <button
        onClick={() => { setSelectedDate(today); setViewMonth(new Date()); }}
        className="mt-3 w-full text-xs text-brand-600 dark:text-brand-400 hover:underline"
      >
        Go to today
      </button>
    </div>
  );
}
