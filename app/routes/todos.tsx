import { useState } from 'react';
import {
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
  json,
  redirect
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from "@remix-run/react";

// import TodoForm, { links as todoFormLinks } from "~/components/TodoForm";
import Heading, { links as headingLinks } from "~/components/Heading";

import styles from "~/styles/todos.css";
import { getTodos, saveTodos } from "~/todos";

import type { Todo } from "~/types";

import type { V2_MetaFunction } from "@remix-run/node";

type ActionData = {
  fields: { text?: string },
  fieldErrors: { text?: string },
  formError?: string
}

let editId = -1;

// This function will only be present on the server and will run there.
// It is triggered by all non-GET requests to this route.
// Note how the front and back end are implemented in the same file.
export const action: ActionFunction = async ({ request }) => {
  try {
    // No need to use the Fetch API or axios because
    // we are already running in the server.

    const formData = await request.formData();

    // This is one way to get data from formData.
    // const intent = formData.get("intent") as string;

    // This is another way to get data from formData.
    const values = Object.fromEntries(formData);
    const { addText, intent, updateText } = values;

    if (intent === "add") {
      await addTodo(addText);
    } else if (intent?.startsWith("delete-")) {
      await deleteTodo(intent);
    } else if (intent?.startsWith("edit-")) {
      await editTodo(intent);
    } else if (intent?.startsWith("update-")) {
      await updateTodo(intent, updateText);
    }

    return {}; // stays on current page
    // return redirect(path); // redirects to another page
    // return redirect('/todos'); // redirects to another page
  } catch (e) {
    console.error("todos.tsx action:", e);
  }
};

/* function clearForm() {
  const input = document.querySelector("#text");
  console.log("clearForm: input =", input);
  input.value = "";
} */

async function addTodo(text: string) {
  // await sleep(1); // to demonstrate "isSubmitting" state

  const fieldErrors = {
    text: validateText(text)
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return { formError: "Invalid data found.", fieldErrors };
  }

  const id = Date.now()
  const todo = { id, text };
  let todos = await getTodos();
  todos.push(todo);
  await saveTodos(todos);
}

async function deleteTodo(intent: string) {
  const id = getId(intent);
  let todos = await getTodos();
  const index = todos.findIndex((t: Todo) => t.id === id)
  if (index === -1) {
    return json(
      { message: `No todo with id ${id} found.` },
      { status: 404 }
    );
  }
  todos.splice(index, 1);
  await saveTodos(todos);
  // clearForm();
}

async function editTodo(intent: string) {
  editId = getId(intent);
}

function getId(intent: string): number {
  return Number(intent.split("-")[1]);
}

function handleChange() {
  const input = document.querySelector("#color-input") as HTMLInputElement
  if (input) sessionStorage.setItem('color', input.value);
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...headingLinks(),
  // ...todoFormLinks(),
];

// This function will only be present on the server and will run there.
// It is triggered by all GET requests to this route.
// Because it runs on the server, there are never CORS issues.
// This code can communicate directly with a database.
// This function can be async.
// A source file can define a "loader" function and
// not export a React component.
// In that case it is only defining an API endpoint.
export async function loader({ request }: LoaderArgs) {
  // await sleep(1); // to demonstrate slow fetching

  // Could authenticate with something like
  // await requireUserId(request);
  // which could throw if the user is not authenticated.

  // We could support a query parameter like this:
  // const query = new URL(request.url).searchParams.get('query') ?? '';
  // const todos = await searchTodos(query);
  // Can also return other content types including plain text.
  // return json(todos);

  const todos = await getTodos();
  return { editId, todos };
  // TODO: Why doesn't this also work?
  // return json(getTodos())
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Todos" }]; // sets the page title
};

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function updateTodo(intent: string, text: string) {
  const id = getId(intent);
  let todos = await getTodos();
  const index = todos.findIndex((t: Todo) => t.id === id)
  if (index === -1) {
    return json(
      { message: `No todo with id ${id} found.` },
      { status: 404 }
    );
  }
  todos[index].text = text;
  await saveTodos(todos);
  editId = -1;
}

function validateText(text: string | undefined) {
  if (!text || text.length < 3) {
    return "Todo text must be at least three characters."
  }
}

export default function Todos() {
  const [text, setText] = useState("");

  const data = useLoaderData();
  const { editId, todos } = useLoaderData();
  todos.sort((t1: Todo, t2: Todo) => t1.text.localeCompare(t2.text));

  const actionData = useActionData<ActionData>();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const { formError, fieldErrors } = actionData ?? {};
  const textError = fieldErrors?.text

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === "Enter") {
      // Simulate pressing the green check mark.
      const button = document.querySelector('.button-green') as HTMLButtonElement;
      if (button) button.click();
    } else if (event.key === "Escape") {
      // Simulate pressing the red "X".
      const button = document.querySelector('.button-red') as HTMLButtonElement;
      if (button) button.click();
    }
  }

  // Cannot use browser-only APIs because this code may run on the server.
  return (
    <div className="todos">
      <Heading>Todos</Heading>
      {/* Using Form instead of form enables submitting the form
          without a full page refresh. */}
      <Form method="post" id="todo-form" reloadDocument>
        <div className="add-area">
          {/* Note that the "id" prop is not needed, only "name". */}
          <input
            name="addText"
            onChange={e => setText(e.target.value)}
            placeholder="enter new todo here"
            value={text}
          />
          {textError && (
            <div className="error">{textError}</div>
          )}
          <div className="row">
            {/* TODO: How can you clear the value of `text` after a new Todo is added.? */}
            <button
              disabled={text === '' || isSubmitting}
              name="intent"
              value="add"
            >
              {isSubmitting ? "Adding ..." : "Add"}
            </button>
            {isSubmitting && <div id="spinner"></div>}
            {formError && <div className="error">{formError}</div>}
          </div>
        </div>
        <ol>
          {todos.map(todo => (
            <li key={todo.id}>
              <div>
                {todo.id === editId ?
                  <input name="updateText" defaultValue={todo.text} onKeyUp={handleKeyUp} /> :
                  <div>{todo.text}</div>
                }
                {todo.id === editId ?
                  <div>
                    <button className="button-green" name="intent" value={"update-" + todo.id}>
                      ✓
                    </button>
                    <button className="button-red" name="intent" value={"edit--1"}>
                      ✖
                    </button>
                  </div> :
                  <button className="button-blue" name="intent" value={"edit-" + todo.id}>
                    ✎
                  </button>
                }
                <button name="intent" value={"delete-" + todo.id}>
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ol>
      </Form>
      <Form method="post" id="color-form" onChange={handleChange}>
        <input
          id="color-input"
          name="color"
          placeholder="enter your favorite color"
        />
        <button name="intent" value="color">Save Color</button>
      </Form>
    </div>
  );
}
