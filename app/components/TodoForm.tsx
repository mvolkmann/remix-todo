import styles from "./TodoForm.css";
export const links = () => [{ rel: "stylesheet", href: styles }];

// This is used in root.tsx so it appears on every page.
export default function TodoForm() {
  return (
    <form method="post" id="todo-form">
      <div>
        <input id="text" name="text" required />
      </div>
      <div>
        <button>Add Todo</button>
      </div>
    </form>
  );
}
