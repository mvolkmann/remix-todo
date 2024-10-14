import {type ChangeEvent, type KeyboardEventHandler} from 'react';
import {type LinksFunction} from '@remix-run/node';
import {type Todo} from '~/types';
import styles from './TodoRow.css?url';
import {clickButton} from '~/utils/DOMUtil';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

type Props = {
  todo: Todo;
  editing: boolean;
  setIntent: (intent: string) => void;
  toggleDone: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function TodoRow({todo, editing, setIntent, toggleDone}: Props) {
  const buttons = () => (
    <div className="inline-flex items-center">
      {editing ? (
        <>
          <button
            className="button-ok"
            onClick={() => setIntent('update-' + todo.id)}
          >
            ✓
          </button>
          <button
            className="button-cancel"
            onClick={() => setIntent('edit--1')}
          >
            ✖
          </button>
        </>
      ) : (
        <button
          className="button-edit"
          onClick={() => setIntent('edit-' + todo.id)}
        >
          ✎
        </button>
      )}
      <button name="intent" value={'delete-' + todo.id}>
        🗑
      </button>
    </div>
  );

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = event => {
    if (event.key === 'Enter') {
      clickButton('.button-ok');
    } else if (event.key === 'Escape') {
      clickButton('.button-cancel');
    }
  };

  return (
    <li className="todo-row" key={todo.id}>
      <input
        className="mr-4"
        name={'done-' + todo.id}
        type="checkbox"
        checked={todo.done}
        onChange={toggleDone}
      />
      {editing ? (
        <input
          autoFocus
          name="updateText"
          defaultValue={todo.text}
          onKeyUp={handleKeyUp}
        />
      ) : (
        <span className={'done-' + todo.done}>{todo.text}</span>
      )}
      {buttons()}
    </li>
  );
}
