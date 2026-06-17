import type { TodoItem } from "../types.js";

export function addTodoItem(todos: TodoItem[], item: TodoItem): TodoItem[] {
  return [item, ...todos];
}

export function toggleTodoItem(todos: TodoItem[], id: string): TodoItem[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function removeTodoItem(todos: TodoItem[], id: string): TodoItem[] {
  return todos.filter((t) => t.id !== id);
}
