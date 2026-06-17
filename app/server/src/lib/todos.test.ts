import { describe, it, expect } from "vitest";
import { addTodoItem, toggleTodoItem, removeTodoItem } from "./todos.js";
import type { TodoItem } from "../types.js";

function makeTodo(overrides: Partial<TodoItem> = {}): TodoItem {
  return {
    id: "td1",
    text: "补写第23章高潮",
    detail: "追读下降 15%",
    source: "读者数据",
    createdAt: 1000,
    done: false,
    ...overrides,
  };
}

describe("addTodoItem", () => {
  it("prepends the new item without mutating the original array", () => {
    const existing = [makeTodo({ id: "td0" })];
    const item = makeTodo({ id: "td1" });
    const next = addTodoItem(existing, item);
    expect(next).toEqual([item, existing[0]]);
    expect(existing).toHaveLength(1);
  });
});

describe("toggleTodoItem", () => {
  it("flips done for the matching id and leaves others untouched", () => {
    const todos = [makeTodo({ id: "td1", done: false }), makeTodo({ id: "td2", done: false })];
    const next = toggleTodoItem(todos, "td1");
    expect(next.find((t) => t.id === "td1")?.done).toBe(true);
    expect(next.find((t) => t.id === "td2")?.done).toBe(false);
  });

  it("returns an equivalent array when the id is not found", () => {
    const todos = [makeTodo({ id: "td1" })];
    expect(toggleTodoItem(todos, "missing")).toEqual(todos);
  });
});

describe("removeTodoItem", () => {
  it("filters out the matching id", () => {
    const todos = [makeTodo({ id: "td1" }), makeTodo({ id: "td2" })];
    expect(removeTodoItem(todos, "td1")).toEqual([makeTodo({ id: "td2" })]);
  });
});
