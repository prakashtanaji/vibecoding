export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';
export type ResourceType = 'video' | 'article' | 'practice' | 'course';
export type TrackType = 'faang' | 'mid' | 'startup';

export interface Resource {
  id: number;
  topic_id?: number;
  task_id?: number;
  title: string;
  url: string;
  type: ResourceType;
}

export interface Task {
  id: number;
  topic_id: number | null;
  parent_task_id: number | null;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;   // ISO date string YYYY-MM-DD
  due_time: string | null;   // HH:MM
  recurrence_type: RecurrenceType;
  recurrence_days: string | null;  // JSON array of day indices for 'custom'
  recurrence_end_date: string | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
  resources?: Resource[];
}

export interface Topic {
  id: number;
  track_id: number;
  parent_id: number | null;
  name: string;
  description: string;
  order: number;
  estimated_hours: number;
  children?: Topic[];
  tasks?: Task[];
  resources?: Resource[];
  progress?: number;   // 0-100 computed
  total_tasks?: number;
  done_tasks?: number;
}

export interface Track {
  id: number;
  name: string;
  type: TrackType;
  company: string;
  icon: string;
  order: number;
  topics?: Topic[];
  progress?: number;
}

export interface CreateTaskPayload {
  topic_id?: number | null;
  parent_task_id?: number | null;
  title: string;
  notes?: string;
  status?: TaskStatus;
  priority?: Priority;
  due_date?: string | null;
  due_time?: string | null;
  recurrence_type?: RecurrenceType;
  recurrence_days?: number[] | null;
  recurrence_end_date?: string | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: number;
}
