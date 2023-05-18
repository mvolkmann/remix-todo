import { type ChangeEvent } from 'react';
import type { LinksFunction } from "@remix-run/node";
import type { Todo } from "~/types";
import styles from "./TodoRow.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

type Props = {
  todo: Todo;
  editing: boolean;
  setIntent: (intent: string) => void;
  toggleDone: (event: ChangeEvent) => void;
};

export default function TodoRow({ todo, editing, setIntent, toggleDone }: Props) {

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

  return (
    <li className="todo-row" key={todo.id}>
      <input
        name={'done-' + todo.id}
        type="checkbox"
        checked={todo.done}
        onChange={toggleDone}
      />
      {editing ?
        <input
          name="updateText"
          defaultValue={todo.text}
          onKeyUp={handleKeyUp}
        /> :
        <span className={'done-' + todo.done}>{todo.text}</span>
      }
      <div className="buttons">
        {editing ?
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
          </> :
          <button
            className="button-edit"
            onClick={() => setIntent('edit-' + todo.id)}
          >
            ✎
          </button>
        }
        <button name="intent" value={"delete-" + todo.id}>
          🗑
        </button>
      </div>
    </li>
  );
}
