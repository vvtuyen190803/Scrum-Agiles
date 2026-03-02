import type { Task } from "../types/auth.type";
import { dummyTasks } from "./tasks";

const TASKS_STORAGE_KEY = "tasks_store";

const loadTasksFromStorage = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Task[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

const persistTasks = (tasks: Task[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

let taskStore: Task[] = loadTasksFromStorage() ?? [...dummyTasks];
persistTasks(taskStore);

export const getTasksStore = () => taskStore;

export const setTasksStore = (nextTasks: Task[]) => {
  taskStore = nextTasks;
  persistTasks(taskStore);
};

export const addTaskToStore = (task: Task) => {
  taskStore = [task, ...taskStore];
  persistTasks(taskStore);
};

export const updateTaskInStore = (updatedTask: Partial<Task> & { id: number }) => {
  taskStore = taskStore.map((task) =>
    task.id === updatedTask.id ? { ...task, ...updatedTask } : task
  );
  persistTasks(taskStore);
};

export const removeTaskFromStore = (taskId: number) => {
  taskStore = taskStore.filter((task) => task.id !== taskId);
  persistTasks(taskStore);
};
