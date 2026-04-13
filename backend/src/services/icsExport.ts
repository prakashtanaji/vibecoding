import ical, { ICalCalendarMethod, ICalAlarmType } from 'ical-generator';
import { db } from '../db/schema';

export function generateIcsCalendar(): string {
  const tasks = db.prepare(`
    SELECT t.*, tp.name as topic_name
    FROM tasks t
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.due_date IS NOT NULL AND t.status != 'done'
    ORDER BY t.due_date, t.due_time
  `).all() as any[];

  const cal = ical({
    name: 'SDE Interview Prep',
    method: ICalCalendarMethod.PUBLISH,
    prodId: '//SDE Prep//Task Manager//EN',
  });

  tasks.forEach(task => {
    const dateStr = task.due_date as string;
    const [year, month, day] = dateStr.split('-').map(Number);

    let start: Date;
    let end: Date;

    if (task.due_time) {
      const [h, m] = (task.due_time as string).split(':').map(Number);
      start = new Date(year, month - 1, day, h, m);
      end = new Date(year, month - 1, day, h + 1, m);
    } else {
      start = new Date(year, month - 1, day);
      end = new Date(year, month - 1, day);
    }

    const event = cal.createEvent({
      start,
      end,
      allDay: !task.due_time,
      summary: task.title,
      description: [
        task.notes ?? '',
        task.topic_name ? `Topic: ${task.topic_name}` : '',
        `Priority: ${task.priority}`,
      ].filter(Boolean).join('\n'),
    });

    // Add alarm 15 minutes before if time is set
    if (task.due_time) {
      event.createAlarm({ type: ICalAlarmType.display, triggerBefore: 15 * 60 });
    }
  });

  return cal.toString();
}

export function generateDailyReviewEvents(daysAhead = 30): string {
  const cal = ical({
    name: 'SDE Prep – Daily Reviews',
    method: ICalCalendarMethod.PUBLISH,
  });

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(9, 0, 0, 0);
    const end = new Date(d);
    end.setMinutes(30);

    cal.createEvent({
      start: d,
      end,
      summary: '📚 SDE Prep – Daily Review',
      description: 'Review progress, pick top 3 tasks for today, update your prep tracker.',
    });
  }

  return cal.toString();
}
