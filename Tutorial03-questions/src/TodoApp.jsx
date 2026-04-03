import { useState, useRef } from 'react';
/* We import several icons (Trash2, Plus, Check, X, Edit2) from the lucide-react library to use in our TodoApp component for adding, editing, and deleting tasks. */
/* If you don't have lucide-react installed, you can replace these icons with simple text or other icons of your choice. */
/* Or you can install it using npm: npm install lucide-react */
import { Trash2, Plus, Check } from 'lucide-react';
import './TodoApp.css';

export default function TodoApp() {
  /* The todos state holds an array of todo objects, each with an id, text, and completed status. */
  const [todos, setTodos] = useState([]);
  /* The input state manages the current value of the input field for adding new tasks. */
  const [input, setInput] = useState('');
  const inputRef = useRef();

  const addTodo = () => {
    if (input.trim()) {
      /* adding a new todo to the list by creating a new object with a unique id, the input text, and a completed status of false. */
      setTodos([...todos, {
        id: Date.now(),
        text: input.trim(),
        completed: false
      }]);
      /* clears the input field after adding a new todo. */
      setInput('');
      inputRef.current.focus();
    }
  };

  const toggleTodo = (id) => {
    /* check each todo in the list and toggles the completed status of the one that matches the given id. */
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    /* finds the todo to be deleted based on the provided id and removes it from the todos state. */
    // Your code here ...
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="header">
          <h1 className="header-title">My Tasks</h1>
          <p className="header-subtitle">Stay organized and productive</p>
        </div>

        <div className="input-section">
          <input
            type="text"
            value={input}
            ref={inputRef}
            /* Updates the input state with the current value of the input field whenever the user types something. Don't bother defining this function separately since it's a simple state update. */
            onChange={(e) => setInput(e.target.value)}
            /* Allows the user to add a new todo by pressing the Enter key while focused on the input field. If the Enter key is pressed, the addTodo function is called to add the new task to the list. */
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <button onClick={addTodo} className="add-button">
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="todo-list">
          {/* Accesses the todos state to determine whether to display an empty state message or a list of todo items. */}
          {todos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💀</div>
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul className="todo-items">
              {todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  {/* If a todo is not being edited, it renders the normal view of the todo item with a checkbox, text, and delete button. */}
                  <button
                    /* Flips the completed status of the todo when the checkbox is clicked. */
                    onClick={() => toggleTodo(todo.id)}
                    /* Style the todo item differently based on whether it is completed or not. */
                    className={`checkbox ${todo.completed ? 'checkbox-completed' : ''}`}
                  >
                    {/* The check icon shows differently based on whether the todo is completed or not. */}
                    {todo.completed && <Check size={16} className="check-icon" />}
                  </button>
                  {/* Applies an extra CSS class to the todo text for the completed items. */}
                  <span className={`todo-text ${todo.completed ? 'todo-completed' : ''}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Display unfinished tasks count only if there are todos (not empty) */}
        {todos.length > 0 && (
          <div className="stats">
            <span>{todos.filter(t => !t.completed).length} tasks remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}