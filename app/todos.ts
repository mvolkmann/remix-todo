import fs from "fs/promises";
import type { Todo } from "~/types";

// This would typically use a database instead of a text file.
// It will look for this file in the root project directory.
const filePath = "todos.json";

export async function getTodos() {
  const json = await fs.readFile(filePath, { encoding: "utf-8" });
  return JSON.parse(json) || [];
}

export function saveTodos(todos: Todo[]) {
  return fs.writeFile(filePath, JSON.stringify(todos));
}
