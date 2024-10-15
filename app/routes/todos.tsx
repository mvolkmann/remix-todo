import {useEffect, useState} from 'react';
import {type ActionFunction, type LinksFunction} from '@remix-run/node';
import {
  createTodo,
  deleteTodo,
  getTodos,
  toggleDone,
  updateTodo
} from '~/utils/PrismaUtils';

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation
} from '@remix-run/react';

import Heading, {links as headingLinks} from '~/components/Heading';
import TodoRow, {links as todoRowLinks} from '~/components/TodoRow';
import {setInputValue, submitForm} from '~/utils/DOMUtil';

import type {Todo, Todos} from '~/types';

import type {MetaFunction} from '@remix-run/node';

type ActionData = {
  fields: {text?: string};
  fieldErrors: {text?: string};
  formError?: string;
};

let editId = -1;

// This function will only be present on the server and will run there.
// It is triggered by all non-GET requests to this route.
// Note how the front and back end are implemented in the same file.
export const action: ActionFunction = async ({request}) => {
  try {
    // No need to use the Fetch API or axios because
    // we are already running in the server.
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    // This is another way to get data from formData.
    // const values = Object.fromEntries(formData);
    // const { addText, intent, updateText } = values;

    if (intent === 'add') {
      const text = formData.get('addText') as string;
      await addTodo(text);
    } else if (intent?.startsWith('delete-')) {
      await deleteTodo(getId(intent));
    } else if (intent?.startsWith('edit-')) {
      editId = getId(intent); // start editing
    } else if (intent?.startsWith('toggle-')) {
      await toggleDone(getId(intent));
    } else if (intent?.startsWith('update-')) {
      const text = formData.get('updateText') as string;
      await updateTodo(getId(intent), text);
      editId = -1; // stop editing
    }

    return {}; // stays on current page
    // return redirect('/todos'); // redirects to another page
  } catch (e) {
    console.error('todos.tsx action:', e);
    return {formError: 'Something went wrong. Please try again.'};
  }
};

async function addTodo(text: string) {
  // await sleep(1); // to demonstrate "isSubmitting" state

  const fieldErrors = {
    text: validateText(text)
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return {formError: 'Invalid data found.', fieldErrors};
  }

  await createTodo({text});
}

function getId(intent: string): number {
  const index = intent.indexOf('-');
  return index === -1 ? index : Number(intent.substring(index + 1));
}

export const links: LinksFunction = () => [
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
  return {editId, todos};
}

export const meta: MetaFunction = () => {
  return [{title: 'Todos'}]; // sets the page title
};

function validateText(text: string | undefined) {
  if (!text || text.length < 3) {
    return 'Todo text must be at least three characters.';
  }
}

export default function Todos() {
  const [changingColor, setChangingColor] = useState(false);
  const [color, setColor] = useState('');
  const [text, setText] = useState('');

  const {editId, todos} = useLoaderData<Todos>();
  todos.sort((t1: Todo, t2: Todo) => t1.text.localeCompare(t2.text));

  const actionData = useActionData<ActionData>();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {formError, fieldErrors} = actionData ?? {};
  const textError = fieldErrors?.text;

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      const storedColor = sessionStorage.getItem('color');
      if (storedColor) setColor(storedColor);
    }
  }, []);

  function handleChange() {
    setChangingColor(true);
  }

  function handleSubmit() {
    const input = document.querySelector('#color-input') as HTMLInputElement;
    if (input) {
      setColor(input.value);
      sessionStorage.setItem('color', input.value);
    }
    setChangingColor(false);
  }

  function setIntent(intent: string) {
    const input = document.querySelector('#intent') as HTMLInputElement;
    if (input) input.value = intent;
    const form = document.querySelector('#todo-form') as HTMLFormElement;
    if (form) form.submit();
  }

  const uncompleted = todos.filter((t: Todo) => !t.done).length;
  const status = `${uncompleted} of ${todos.length} remaining`;

  // Cannot use browser-only APIs because this code may run on the server.
  return (
    <div className="todos">
      <Heading>Todos</Heading>
      <div>{status}</div>
      <Form method="post" id="todo-form">
        <div className="bg-gray-400 flex flex-col gap-4 items-start p-4">
          <div className="flex gap-4 items-center">
            {/* Note that the "id" prop is not needed, only "name". */}
            <input
              className="w-80"
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
        <ul className="list-none ml-0 pl-0">
          {todos.map((todo: Todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              editing={todo.id === editId}
              setIntent={setIntent}
            />
          ))}
        </ul>
        <input type="hidden" id="intent" name="intent" />
      </Form>
      <Form method="post" id="color-form" onSubmit={handleSubmit}>
        <input
          className="mr-4"
          defaultValue={color}
          id="color-input"
          name="color"
          onChange={handleChange}
          placeholder="enter your favorite color"
        />
        <button disabled={!changingColor} name="intent" value="color">
          Save Color
        </button>
      </Form>
    </div>
  );
}
