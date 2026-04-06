import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Check, X, Edit2 } from 'lucide-react';
import './TodoApp.css';

const API_BASE_URL = 'http://127.0.0.1:8000/todos';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const inputRef = useRef(null);

  // A useEffect with an empty dependency array ([]) will not run after a re-render.
  // It only runs once, after the initial render of the component (mounting).
  useEffect(() => {
    fetchTodos(); // fetch todos from the backend API
    inputRef.current?.focus(); // initially, focus on the input field
  }, []);

  // update the pending task number whenever the todos state changes
  useEffect(() => {
    const pendingCount = todos.filter(t => !t.completed).length;
    document.title = `Tasks (${pendingCount} pending)`;
  }, [todos]);

  // Fetch todos from backend upon initialization and after any changes to the todos state
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const addTodo = async () => {
    if (input.trim()) {
      try {
        // Instead of reading from localStorage, we are fetch todos from a backend endpoint.
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // must specify the data type
          },
          body: JSON.stringify({
            id: Date.now(), // the Date.now() fucntion returns a number, which is aligned to the int type in Python.
            text: input.trim(),
            completed: false,
          }),
        });
        if (response.ok) {
          fetchTodos(); // actively fetch latest todos from endpoint to ensure the rendered data sync with backend.
        }
      } catch (error) {
        alert("Error saving a new todo.");
        alert(error);
      }

      setInput('');
      inputRef.current?.focus(); // keep focus after adding
    }
  };

  const toggleTodo = async (id) => {
    // find this todo item by its id
    const todoToToggle = todos.find(todo => todo.id === id);
    // if an item is not found with this id, the return would be an undefined, and we can skip any further action.
    if (todoToToggle !== undefined) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...todoToToggle, // use the spread operator to get all the property:value pairs inside the object
            completed: !todoToToggle.completed, // update the complted propoerty with the opposite value
          }),
        });
        if (response.ok) {
          fetchTodos(); // fetch from backend to make sure latest todos are rendered.
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

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
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
              text: editText.trim(), // create a new todo object with updated value on the 'text' property.
            }),
          });
          if (response.ok) {
            fetchTodos();
            cancelEdit(); // end the editing status for the web page upon done editing
          }
        } catch (error) {
          alert("Error toggleing a todo's completed status.");
          alert(error);
        }
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
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
            onChange={(e) => setInput(e.target.value)}
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
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="edit-input"
                        autoFocus // Native attribute for focus on mount
                      />
                      <button onClick={saveEdit} className="save-button">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} className="cancel-button">
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
                      <button
                        onClick={() => startEdit(todo)}
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
        {todos.length > 0 && (
          <div className="stats">
            <span>{todos.filter(t => !t.completed).length} tasks remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}