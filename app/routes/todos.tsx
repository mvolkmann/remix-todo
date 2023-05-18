import { ChangeEvent, useState } from 'react';

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

type MyFormData = {
  addText: string,
  intent: string,
  updateDone: boolean,
  updateText: string
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
    const addText = formData.get('addText') as string;
    const intent = formData.get('intent') as string;
    const updateText = formData.get('updateText') as string;

    // This is another way to get data from formData.
    const values = Object.fromEntries(formData) as MyFormData;
    console.log('todos.tsx action: values =', values);
    // const { addText, intent, updateDone, updateText } = values;

    if (intent === "add") {
      await addTodo(addText);
    } else if (intent?.startsWith("delete-")) {
      await deleteTodo(intent);
    } else if (intent?.startsWith("edit-")) {
      await editTodo(intent);
    } else if (intent?.startsWith("update-")) {
      const id = getId(intent);
      await updateTodoText(id, updateText);
    }

    for (const key of Object.keys(values)) {
      if (key.startsWith('done-')) {
        const id = getId(key);
        const done = values[key] === 'on';
        console.log('todos.tsx action: id =', id, 'done =', done);
        updateTodoDone(id, done)
      }
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
  const todo: Todo = { done: false, id, text };
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

async function updateTodoDone(id: number, done: boolean) {
  let todos = await getTodos();
  const index = todos.findIndex((t: Todo) => t.id === id)
  if (index === -1) {
    return json(
      { message: `No todo with id ${id} found.` },
      { status: 404 }
    );
  }
  todos[index].done = done;
  console.log('todos.tsx updateTodoDone: todos =', todos);
  await saveTodos(todos);
}

async function updateTodoText(id: number, text: string) {
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

  const { editId, todos } = useLoaderData();
  todos.sort((t1: Todo, t2: Todo) => t1.text.localeCompare(t2.text));

  const actionData = useActionData<ActionData>();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const { formError, fieldErrors } = actionData ?? {};
  const textError = fieldErrors?.text

  function clickButton(selector: string) {
    const button = document.querySelector(selector) as HTMLButtonElement;
    console.log('todos.tsx clickButton: button =', button);
    if (button) button.click();
  }

  function handleCheckbox(event: ChangeEvent<HTMLInputElement>) {
    const done = event.target?.checked;
    console.log('todos.tsx handleCheckbox: done =', done);
    const form = document.querySelector('#todo-form') as HTMLFormElement;
    form.submit();
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === "Enter") {
      clickButton('.button-ok');
    } else if (event.key === "Escape") {
      clickButton('.button-cancel');
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
          <div className="row">
            {/* Note that the "id" prop is not needed, only "name". */}
            <input
              name="addText"
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
            {isSubmitting && <div id="spinner"></div>}
          </div>

          {textError && (
            <div className="error">{textError}</div>
          )}

          {formError && <div className="error">{formError}</div>}
        </div>
        <ul>
          {todos.map((todo: Todo) => (
            <li key={todo.id}>
              <input
                name={'done-' + todo.id}
                type="checkbox"
                checked={todo.done}
                onChange={handleCheckbox}
              />
              {todo.id === editId ?
                <input
                  name="updateText"
                  defaultValue={todo.text}
                  onKeyUp={handleKeyUp}
                /> :
                <span className={'done-' + todo.done}>{todo.text}</span>
              }
              {todo.id === editId ?
                <span>
                  <button
                    className="button-ok"
                    name="intent"
                    value={"update-" + todo.id}
                  >
                    ✓
                  </button>
                  <button
                    className="button-cancel"
                    name="intent"
                    value={"edit--1"}
                  >
                    ✖
                  </button>
                </span> :
                <button
                  className="button-edit"
                  name="intent"
                  value={"edit-" + todo.id}
                >
                  ✎
                </button>
              }
              <button name="intent" value={"delete-" + todo.id}>
                🗑
              </button>
            </li>
          ))}
        </ul>
      </Form >
      <Form method="post" id="color-form" onChange={handleChange}>
        <input
          id="color-input"
          name="color"
          placeholder="enter your favorite color"
        />
        <button name="intent" value="color">Save Color</button>
      </Form>
    </div >
  );
}
