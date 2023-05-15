import { useState } from 'react';
import { type ActionFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

// import TodoForm, { links as todoFormLinks } from "~/components/TodoForm";
import Heading, { links as headingLinks } from "~/components/Heading";

import styles from "~/styles/todos.css";
import { getTodos, saveTodos } from "~/todos";

import type { Todo } from "~/types";

import type { V2_MetaFunction } from "@remix-run/node";

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// This function will only be present on the server and will run there.
// It is triggered by all non-GET requests to this route.
export const action: ActionFunction = async ({ request }) => {
  try {
    let todos = await getTodos();
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "add") {
      await sleep(1); // to demonstrate "isSubmitting" state
      const todo = { text: formData.get("text") };
      todos.push(todo);
      await saveTodos(todos);
    } else if (intent?.startsWith("delete-")) {
      const index = Number(intent.split("-")[1]);
      todos.splice(index, 1);
      await saveTodos(todos);
      // clearForm();
    }

    return null;
  } catch (e) {
    console.error("todos.tsx action:", e);
  }
};

/* function clearForm() {
  const input = document.querySelector("#text");
  console.log("clearForm: input =", input);
  input.value = "";
} */

export const links = () => [
  { rel: "stylesheet", href: styles },
  ...headingLinks(),
  // ...todoFormLinks(),
];

// This function will only be present on the server and will run there.
// It is triggered by all GET requests to this route.
export function loader() {
  return getTodos();
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Todos" }]; // sets the page title
};

export default function Todos() {
  const [text, setText] = useState("");
  const todos: Todo[] = useLoaderData();
  todos.sort((t1, t2) => t1.text.localeCompare(t2.text));

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Cannot use browser-only APIs because this code may run on the server.
  return (
    <div className="todos">
      <Heading>Todos</Heading>
      {/* Using Form instead of form enables submitting the form
          without a full page refresh. */}
      <Form method="post" id="todo-form">
        <div className="add-area">
          {/* TODO: Can this use only id or only name? */}
          <input
            id="text"
            name="text"
            onChange={e => setText(e.target.value)}
            placeholder="enter new todo here"
            value={text}
          />
          <button
            disabled={text === '' || isSubmitting}
            name="intent"
            value="add"
          >
            {isSubmitting ? "Adding ..." : "Add"}
          </button>
        </div>
        <ol>
          {todos.map((todo, index: number) => (
            <li key={index}>
              {todo.text}
              <button name="intent" value={"delete-" + index}>
                🗑
              </button>
            </li>
          ))}
        </ol>
      </Form>
    </div>
  );
}
