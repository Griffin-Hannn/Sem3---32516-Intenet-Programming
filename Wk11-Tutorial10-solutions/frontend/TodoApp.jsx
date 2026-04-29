import { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Check, X, Edit2 } from 'lucide-react';
import './TodoApp.css';

const API_BASE_URL = 'http://127.0.0.1:8000/todos';

const initialState = {
  todos: [],
  input: '',
  editingId: null,
  editText: '',
};

const todoAppReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    case 'START_EDIT':
      return { ...state, editingId: action.payload.id, editText: action.payload.text };
    case 'SET_EDIT_TEXT':
      return { ...state, editText: action.payload };
    case 'CANCEL_EDIT':
      return { ...state, editingId: null, editText: '' };
    default:
      return state;
  }
};

export default function TodoApp() {

  // Authentication State: We use state here is to trigger re-renders, which cannot be done with localStorage alone.
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  // Navigation hook from react-router-dom
  const navigate = useNavigate(); // 1. Initialize the hook

  // Main state management using useReducer
  const [state, dispatch] = useReducer(todoAppReducer, initialState);
  const { todos, input, editingId, editText } = state;

  const inputRef = useRef(null);

  useEffect(() => {
    if (token) {
      // If token exists, ensure state is in sync with localStorage (in case of page refresh)
      setToken(localStorage.getItem('token'));
      setUsername(localStorage.getItem('username'));
      fetchTodos();
      inputRef.current?.focus();
    }
  }, [token]);

  useEffect(() => {
    const pendingCount = todos.filter(t => !t.completed).length;
    document.title = `Tasks (${pendingCount} pending)`;
  }, [todos]);

  // Logout function: Clears auth data and resets state, then navigates to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    dispatch({ type: 'SET_TODOS', payload: [] });
    dispatch({ type: 'SET_EDIT_TEXT', payload: '' });
    navigate('/login', { replace: true });
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        // We need to include the token in the Authorization header for every endpoints that requries authentication
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      dispatch({ type: 'SET_TODOS', payload: data });
    } catch (error) {
      handleLogout();
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
            'Authorization': `Bearer ${token}`, // add the token to the Authorization header for authenticated requests
          },
          body: JSON.stringify({
            id: new Date(Date.now()).toISOString(),
            user_id: username,
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
      dispatch({ type: 'SET_INPUT', payload: '' });
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
            'Authorization': `Bearer ${token}`, // add the token to the Authorization header for authenticated requests
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
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`, // add the token to the Authorization header for authenticated requests
            },
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
              'Authorization': `Bearer ${token}`, // add the token to the Authorization header for authenticated requests
            },
            body: JSON.stringify({
              ...todoToEdit,
              text: editText.trim(),
            }),
          });
          if (response.ok) {
            fetchTodos();
            dispatch({ type: 'CANCEL_EDIT' });
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
          {/* Display connection status with a badge: green for online, red for offline */}
          <span className={`status-badge ${token ? 'online' : 'offline'}`}>
            {token ? `● Connected as ${username}` : '● Offline'}
          </span>
        </div>

        <div className="input-section">
          <input
            type="text"
            ref={inputRef} // attaching the ref here
            value={input}
            onChange={(e) => dispatch({ type: 'SET_INPUT', payload: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="todo-input"
            disabled={editingId !== null}
          />
          <button onClick={addTodo} className="add-button" disabled={editingId !== null}>
            <Plus size={20} />
            Add
          </button>
          {/* Logout button */}
          <button className="cancel-button" onClick={handleLogout}>Logout</button>
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
                        onChange={(e) => dispatch({ type: 'SET_EDIT_TEXT', payload: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') dispatch({ type: 'CANCEL_EDIT' });
                        }}
                        className="edit-input"
                        autoFocus // Native attribute for focus on mount
                      />
                      <button onClick={saveEdit} className="save-button">
                        <Check size={18} />
                      </button>
                      <button onClick={() => dispatch({ type: 'CANCEL_EDIT' })} className="cancel-button">
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
                        onClick={() => dispatch({ type: 'START_EDIT', payload: todo })}
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