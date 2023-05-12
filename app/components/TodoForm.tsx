import styles from "./TodoForm.css";
export const links = () => [{ rel: "stylesheet", href: styles }];

// This is used in root.tsx so it appears on every page.
export default function TodoForm() {
  return (
    <form method="post" id="todo-form">
      <div className="row">
        {/* TODO: Can this use only id or only name? */}
        <input
          id="text"
          name="text"
          placeholder="enter new todo here"
          required
        />
        <button>Add</button>
      </div>
    </form>
  );
}
