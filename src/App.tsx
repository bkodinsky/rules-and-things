import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { 
  Button, 
  Card, 
  CheckboxField, 
  Collection, 
  Divider, 
  Flex, 
  Heading, 
  Text, 
  TextField, 
  View,
  Icon
} from "@aws-amplify/ui-react";
import TodoCreateForm from "./ui-components/TodoCreateForm";
import { Plus, Trash } from './components/Icons';
import './App.css';

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodoContent, setNewTodoContent] = useState("");

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    if (newTodoContent.trim()) {
      client.models.Todo.create({
        content: newTodoContent,
        isDone: false,
      });
      setNewTodoContent("");
    }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createTodo();
    }
  };

  return (
    <View className="app-container">
      <Card variation="elevated" className="todo-card">
        <Flex direction="column" gap="1rem">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={3}>Welcome, {user?.signInDetails?.loginId?.split('@')[0]}</Heading>
            <Button size="small" onClick={signOut} variation="link">Sign out</Button>
          </Flex>
          
          <Divider />
          
          <Heading level={5}>Your Tasks</Heading>
          
          <Flex direction="row" gap="0.5rem">
            <TextField
              placeholder="Add a new task..."
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="new-todo-input"
            />
            <Button onClick={createTodo} variation="primary">
              <Icon as={Plus} />
            </Button>
          </Flex>
          
          {todos.length === 0 ? (
            <Flex justifyContent="center" padding="2rem">
              <Text>You have no tasks yet. Create one to get started!</Text>
            </Flex>
          ) : (
            <Collection
              items={todos.sort((a, b) => {
                // Sort completed items to the bottom
                if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
                // Otherwise sort by creation time (assuming newer items have larger IDs)
                return a.id > b.id ? -1 : 1;
              })}
              className="todo-list"
            >
              {(todo) => (
                <Flex 
                  key={todo.id} 
                  direction="row" 
                  alignItems="center" 
                  gap="0.5rem"
                  padding="0.75rem"
                  className={`todo-item ${todo.isDone ? 'completed' : ''}`}
                >
                  <CheckboxField
                    checked={todo.isDone}
                    onChange={() => toggleTodoStatus(todo.id, todo.isDone ?? false)}
                    labelPosition="end"
                    label={
                      <Text className={todo.isDone ? 'completed-text' : ''}>
                        {todo.content}
                      </Text>
                    }
                  />
                  <Button 
                    variation="destructive" 
                    size="small"
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    <Icon as={Trash} />
                  </Button>
                </Flex>
              )}
            </Collection>
          )}
        </Flex>
      </Card>
    </View>
  );
}

export default App;
