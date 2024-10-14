export type Todo = {
  id?: number;
  text: string;
  done?: boolean;
};

export type Todos = {
  editId: number;
  todos: Todo[];
};
