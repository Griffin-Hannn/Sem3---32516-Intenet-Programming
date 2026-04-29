import { useEffect, useRef, useReducer } from 'react';
import { Trash2, Plus, Check, X, Edit2 } from 'lucide-react';
import './TodoApp.css';

const API_BASE_URL = 'http://127.0.0.1:8000/todos';

// Initial state and reducer for useReducer
const initialState = {
  todos: [],
  input: '',
  editingId: null,
  editText: '',
};

// Reducer to manage state transitions based on action types
const todoAppReducer = (state, action) => {
  // Your reducer logic to handle different action types and update state accordingly
  // Write your code here...
};

export default function TodoApp() {
  // Define the useReducer hook with the reducer and initial state
  // Write your code here...

  // Destructure state variables for easier access
  const { todos, input, editingId, editText } = state;

  const inputRef = useRef(null);

  useEffect(() => {
    fetchTodos();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const pendingCount = todos.filter(t => !t.completed).length;
    document.title = `Tasks (${pendingCount} pending)`;
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      // Write your code to replace setTodos(data) here...

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const addTodo = async () => {
    if (input.trim()) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: new Date(Date.now()).toISOString(),
            user_id: sessionStorage.getItem('user'),
            text: input.trim(),
            completed: false,
          }),
        });
        if (response.ok) {
          fetchTodos();
        }
      } catch (error) {
        alert("Error saving a new todo.");
      }
      // Write your code to replace setInput('') here...

      inputRef.current?.focus(); // keep focus after adding
    }
  };

  const toggleTodo = async (id) => {
    const todoToToggle = todos.find(todo => todo.id === id);
    if (todoToToggle !== undefined) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...todoToToggle,
            completed: !todoToToggle.completed,
          }),
        });
        if (response.ok) {
          fetchTodos();
        }
      } catch (error) {
        alert("Error toggleing a todo's completed status.");
      }
    }
  };

  const deleteTodo = async (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (window.confirm(`Are you sure you want to delete "${todoToDelete.text}"?`)) {
      if (todoToDelete !== undefined) {
        try {
          const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            fetchTodos();
          }
        } catch (error) {
          alert("Error deleting a todo.");
        }
      }
    }
  };

  const saveEdit = async () => {
    if (editText.trim()) {
      const todoToEdit = todos.find(todo => todo.id === editingId);
      if (todoToEdit !== undefined) {
        try {
          const response = await fetch(`${API_BASE_URL}/${editingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...todoToEdit,
              text: editText.trim(),
            }),
          });
          if (response.ok) {
            fetchTodos();
            // Write your code to replace cancelEdit(); here...

          }
        } catch (error) {
          alert("Error saving edited todo.");
        }
      }
    }
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
            ref={inputRef} // attaching the ref here
            value={input}
            // onChange={(e) => setInput(e.target.value)}
            // The above line should be replaced with a dispatch to update the input state in the reducer
            // Write your code here...

            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="todo-input"
            disabled={editingId !== null}
          />
          <button onClick={addTodo} className="add-button" disabled={editingId !== null}>
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul className="todo-items">
              {todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  {/* the current todo is being edited */}
                  {editingId === todo.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editText}
                        // onChange={(e) => setEditText(e.target.value)}
                        // The above line should be replaced with a dispatch to update the editText state in the reducer
                        // Write your code here...

                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          // if (e.key === 'Escape') cancelEdit();
                          // The above line should be replaced with a dispatch to cancel the edit mode in the reducer
                          // Complete your code below by adding an action to take upon key press ...
                          if (e.key === 'Escape') pass;
                        }}
                        className="edit-input"
                        autoFocus // Native attribute for focus on mount
                      />
                      <button onClick={saveEdit} className="save-button">
                        <Check size={18} />
                      </button>
                      {/* <button onClick={cancelEdit} className="cancel-button"> */}
                      {/* The above line should be replaced with a button that can trigger a dispatch to cancel the edit mode in the reducer */}
                      {/* Complete the code below by adding an onClick event... */}
                      <button className="cancel-button">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    /* The todo is not being edited */
                    <>
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`checkbox ${todo.completed ? 'checkbox-completed' : ''}`}
                        disabled={editingId !== null}
                      >
                        {/* the Button shows a Check icon */}
                        {todo.completed && <Check size={16} className="check-icon" />}
                      </button>
                      <span className={`todo-text ${todo.completed ? 'todo-completed' : ''} ${editingId !== null ? 'disabled' : ''}`}>
                        {todo.text}
                      </span>
                      {/* the Button shows an Edit2 icon */}
                      {/* <button
                        onClick={() => startEdit(todo)}
                        className="edit-button"
                        disabled={editingId !== null}
                      > */}
                      {/* The above line should be replaced with a button that can trigger a dispatch to start the edit mode in the reducer, passing the current todo's data */}
                      {/* Complete the code below by adding an onClick event... */}
                      <button
                        className="edit-button"
                        disabled={editingId !== null}
                      >
                        <Edit2 size={18} />
                      </button>
                      {/* the Button shows a Trash2 icon */}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="delete-button"
                        disabled={editingId !== null}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {
          todos.length > 0 && (
            <div className="stats">
              <span>{todos.filter(t => !t.completed).length} tasks remaining</span>
            </div>
          )
        }
      </div >
    </div >
  );
}