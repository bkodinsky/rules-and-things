import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import TodoCreateForm from "./ui-components/TodoCreateForm";

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
      isDone: false,
    });
  }

  
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  function toggleTodoStatus(id: string, currentStatus: boolean) {
    client.models.Todo.update({
      id,
      isDone: !currentStatus,
    });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.isDone ? 'line-through' : 'none' }}>
              {todo.content}
            </span>
            <button onClick={() => toggleTodoStatus(todo.id, todo.isDone ?? false)}>
              {todo.isDone ? 'Undo' : 'Complete'}
            </button>
            <button onClick={() => deleteTodo(todo.id)}>
              {'Delete'}
            </button>            
          </li>
        ))}
      </ul>
      <button onClick={signOut}>Sign out</button>
      <TodoCreateForm />
    </main>
  );
}

export default App;
