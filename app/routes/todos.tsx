import { createTodo, deleteTodo, getTodos, updateTodo } from '~/utils/todos';

import { type ChangeEvent, useState } from 'react';

import { type ActionFunction, type LinksFunction } from '@remix-run/node';

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from '@remix-run/react';

import Heading, { links as headingLinks } from '~/components/Heading';
import TodoRow, { links as todoRowLinks } from '~/components/TodoRow';
import { setInputValue, submitForm } from '~/utils/DOMUtil';

import styles from '~/styles/todos.css';

import type { Todo } from '~/types';

import type { V2_MetaFunction } from '@remix-run/node';

type ActionData = {
  fields: { text?: string };
  fieldErrors: { text?: string };
  formError?: string;
};

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
    // const values = Object.fromEntries(formData);
    // const { addText, doneId, doneValue, intent, updateText } = values;

    if (intent === 'add') {
      await addTodo(addText);
    } else if (intent?.startsWith('delete-')) {
      await deleteSelectedTodo(intent);
    } else if (intent?.startsWith('edit-')) {
      await editTodo(intent);
    } else if (intent?.startsWith('update-')) {
      const id = getId(intent);
      const todo: Todo = { id, text: updateText };
      await updateTodo(todo);
      editId = -1;
    }

    if (doneId) {
      // TypeScript complains that the "text" property is missing,
      // but we don't want to specify it in this case.
      // We want to keep the current value, but we don't know what it is here.
      const todo: Todo = { id: doneId, done: doneValue };
      await updateTodo(todo);
    }

    return {}; // stays on current page
    // return redirect('/todos'); // redirects to another page
  } catch (e) {
    console.error('todos.tsx action:', e);
  }
};

async function addTodo(text: string) {
  // await sleep(1); // to demonstrate "isSubmitting" state

  const fieldErrors = {
    text: validateText(text)
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { formError: 'Invalid data found.', fieldErrors };
  }

  await createTodo({ text });
}

async function deleteSelectedTodo(intent: string) {
  await deleteTodo(getId(intent));
}

async function editTodo(intent: string) {
  editId = getId(intent);
}

function getId(intent: string): number {
  const index = intent.indexOf('-');
  return index === -1 ? index : Number(intent.substring(index + 1));
}

function handleChange() {
  const input = document.querySelector('#color-input') as HTMLInputElement;
  if (input) sessionStorage.setItem('color', input.value);
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...headingLinks(),
  ...todoRowLinks()
];

// export async function loader({ request }: LoaderArgs) {
export async function loader() {
  // await sleep(1); // to demonstrate slow fetching

  // We could authenticate with something like
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
  return [{ title: 'Todos' }]; // sets the page title
};

function validateText(text: string | undefined) {
  if (!text || text.length < 3) {
    return 'Todo text must be at least three characters.';
  }
}

export default function Todos() {
  const [text, setText] = useState('');

  const { editId, todos } = useLoaderData();
  todos.sort((t1: Todo, t2: Todo) => t1.text.localeCompare(t2.text));

  const actionData = useActionData<ActionData>();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const { formError, fieldErrors } = actionData ?? {};
  const textError = fieldErrors?.text;

  function setIntent(intent: string) {
    setInputValue('#intent', intent);
    submitForm('#todo-form');
  }

  function toggleDone(event: ChangeEvent<HTMLInputElement>) {
    // Determine the id and done state of the todo that was toggled.
    const checkbox = event.target;
    // checkbox.name will be "done-" followed by the id of the todo.
    const id = getId(checkbox.name); // number
    const done = checkbox.checked; // boolean

    // Update the values of hidden inputs so they can be sent in the form post.
    // This seems like a hacky approach.
    setInputValue('#doneId', id);
    setInputValue('#doneValue', done);

    submitForm('#todo-form');
  }

  const uncompleted = todos.filter((t: Todo) => !t.done).length;
  const status = `${uncompleted} of ${todos.length} remaining`;

  // Cannot use browser-only APIs because this code may run on the server.
  return (
    <div className="todos">
      <Heading>Todos</Heading>
      <div>{status}</div>
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
              {isSubmitting ? 'Adding ...' : 'Add'}
            </button>
            {isSubmitting && <div id="spinner"></div>}
          </div>

          {textError && <div className="error">{textError}</div>}

          {formError && <div className="error">{formError}</div>}
        </div>
        <ul>
          {todos.map((todo: Todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              editing={todo.id === editId}
              setIntent={setIntent}
              toggleDone={toggleDone}
            />
          ))}
        </ul>
        <input type="hidden" id="doneId" name="doneId" />
        <input type="hidden" id="doneValue" name="doneValue" />
        <input type="hidden" id="intent" name="intent" />
      </Form>
      <Form method="post" id="color-form" onChange={handleChange}>
        <input
          id="color-input"
          name="color"
          placeholder="enter your favorite color"
        />
        <button name="intent" value="color">
          Save Color
        </button>
      </Form>
    </div>
  );
}
