import { create } from 'zustand';
import { format } from 'date-fns';

interface UIState {
  // Selected date (YYYY-MM-DD)
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Selected track/topic in sidebar
  selectedTrackId: number | null;
  setSelectedTrackId: (id: number | null) => void;
  selectedTopicId: number | null;
  setSelectedTopicId: (id: number | null) => void;

  // Task form modal
  taskFormOpen: boolean;
  editingTaskId: number | null;
  taskFormTopicId: number | null;
  openNewTask: (topicId?: number | null) => void;
  openEditTask: (taskId: number) => void;
  closeTaskForm: () => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Sidebar collapsed
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const savedDark = localStorage.getItem('darkMode') === 'true';
if (savedDark) document.documentElement.classList.add('dark');

export const useUIStore = create<UIState>((set) => ({
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  setSelectedDate: (date) => set({ selectedDate: date }),

  selectedTrackId: null,
  setSelectedTrackId: (id) => set({ selectedTrackId: id }),
  selectedTopicId: null,
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),

  taskFormOpen: false,
  editingTaskId: null,
  taskFormTopicId: null,
  openNewTask: (topicId = null) => set({ taskFormOpen: true, editingTaskId: null, taskFormTopicId: topicId }),
  openEditTask: (taskId) => set({ taskFormOpen: true, editingTaskId: taskId, taskFormTopicId: null }),
  closeTaskForm: () => set({ taskFormOpen: false, editingTaskId: null, taskFormTopicId: null }),

  darkMode: savedDark,
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
    return { darkMode: next };
  }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
