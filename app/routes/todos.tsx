import { type ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import TodoForm, { links as todoFormLinks } from "~/components/TodoForm";
import Heading, { links as headingLinks } from "~/components/Heading";

import styles from "~/styles/todos.css";
import { getTodos, saveTodos } from "~/todos";

import type { Todo } from "~/types";

import type { V2_MetaFunction } from "@remix-run/node";

// This function will only be present on the server and will run there.
// It is triggered by all non-GET requests to this route.
export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const todo = {
      text: formData.get("text"),
    };
    const todos = await getTodos();
    todos.push(todo);
    await saveTodos(todos);
    return redirect("/demo");
  } catch (e) {
    console.error("todos.tsx action:", e);
  }
};

export const links = () => [
  { rel: "stylesheet", href: styles },
  ...headingLinks(),
  ...todoFormLinks(),
];

// This function will only be present on the server and will run there.
// It is triggered by all GET requests to this route.
export function loader() {
  return getTodos();
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Todos" }];
};

export default function Todos() {
  const todos: Todo[] = useLoaderData();

  async function deleteTodo(index: number) {
    console.log("deleteTodo: index =", index);
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    console.log("deleteTodo: newTodos =", newTodos);
    await saveTodos(newTodos);
    return redirect("/todos");
  }

  return (
    <div className="todos">
      <Heading>Todos</Heading>
      <TodoForm />
      <ol>
        {todos.map((todo, index: number) => (
          <li key={index}>
            {todo.text}
            <button onClick={() => deleteTodo(index)}>🗑</button>
          </li>
        ))}
      </ol>
    </div>
  );
}
