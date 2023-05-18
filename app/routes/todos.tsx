import { createTodo, deleteTodo, getTodos, updateTodo } from '~/utils/todos';

import { useState } from 'react';

import {
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from "@remix-run/react";

import Heading, { links as headingLinks } from "~/components/Heading";

import styles from "~/styles/todos.css";

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
    const addText = formData.get('addText') as string;
    const doneId = Number(formData.get('doneId'));
    const doneValue = formData.get('doneValue') === 'true';
    const intent = formData.get('intent') as string;
    const updateText = formData.get('updateText') as string;

    // This is another way to get data from formData.
    const values = Object.fromEntries(formData);
    // const { addText, intent, updateDone, updateText } = values;

    if (intent === "add") {
      await addTodo(addText);
    } else if (intent?.startsWith("delete-")) {
      await deleteSelectedTodo(intent);
    } else if (intent?.startsWith("edit-")) {
      await editTodo(intent);
    } else if (intent?.startsWith("update-")) {
      const id = getId(intent);
      const todo: Todo = { id, text: updateText }
      await updateTodo(todo);
      editId = -1;
    };

    if (doneId) {
      const todo: Todo = { id: doneId, done: doneValue };
      await updateTodo(todo);
    }

    return {}; // stays on current page
    // return redirect('/todos'); // redirects to another page
  } catch (e) {
    console.error("todos.tsx action:", e);
  }
};

async function addTodo(text: string) {
  // await sleep(1); // to demonstrate "isSubmitting" state

  const fieldErrors = {
    text: validateText(text)
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return { formError: "Invalid data found.", fieldErrors };
  }

  await createTodo({ text });
}

async function deleteSelectedTodo(intent: string) {
  const id = getId(intent);
  console.log('todos.tsx deleteSelectedTodo: id =', id);
  await deleteTodo(id);
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
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Todos" }]; // sets the page title
};

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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
    if (button) button.click();
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === "Enter") {
      clickButton('.button-ok');
    } else if (event.key === "Escape") {
      clickButton('.button-cancel');
    }
  }

  function setInputValue(selector: string, value: any) {
    const input = document.querySelector(selector) as HTMLInputElement;
    input.value = String(value);

  }

  function toggleDone(event) {
    // Determine the id and done state of the todo that was toggled.
    const checkbox = event.target;
    // checkbox.name will be "done-" followed by the id of the todo.
    const id = getId(checkbox.name); // number
    const done = checkbox.checked; // boolean

    // Update the values of hidden inputs so they can be sent in the form post.
    // This seems like a hacky approach.
    setInputValue('#doneId', id);
    setInputValue('#doneValue', done);

    // Submit the form.
    const form = document.querySelector('#todo-form') as HTMLFormElement;
    form.submit();
  }

  const uncompleted = todos.filter((t: Todo) => !t.done).length;
  const status = `${uncompleted} of ${todos.length} remaining`;

  // Cannot use browser-only APIs because this code may run on the server.
  return (
    <div className="todos">
      <Heading>Todos</Heading>
      <div>{status}</div>
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
                onChange={toggleDone}
              />
              {todo.id === editId ?
                <input
                  name="updateText"
                  defaultValue={todo.text}
                  onKeyUp={handleKeyUp}
                /> :
                <span className={'done-' + todo.done}>{todo.text}</span>
              }
              <div className="buttons">
                {todo.id === editId ?
                  <>
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
                  </> :
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
              </div>
            </li>
          ))}
        </ul>
        <input type="hidden" id="doneId" name="doneId" />
        <input type="hidden" id="doneValue" name="doneValue" />
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
