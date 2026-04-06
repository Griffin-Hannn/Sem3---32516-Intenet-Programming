import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Check, X, Edit2 } from 'lucide-react';
import './TodoApp.css';

export default function TodoApp() {
  // --- STATE INITIALIZATION ---
  // Lazy initializer: Runs once on mount to pull saved data
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todo_storage_key');
    // initilize with the stored to-dos in localStorage if it is not empty
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // --- REFS FOR User Experience ---
  const inputRef = useRef(null); // To focus the main input after actions

  // --- EFFECTS ---
  // Save to LocalStorage whenever 'todos' changes
  useEffect(() => {
    // Save todos using the same key that we use to read from localStorage
    localStorage.setItem('todo_storage_key', JSON.stringify(todos));
    // Show the number of pending (uncompleted) tasks in the broswer tab title.
    const pendingCount = todos.filter((t) => !t.completed).length;
    document.title = `Tasks (${pendingCount} pending)`;
  }, [todos]);

  // Focus the input field on initial mount for better user experience
  useEffect(() => {
    // Attempts to set the keyboard focus on an HTML input element if that element currently exists.
    // Using '?' allows us to safely handle cases where the input element is not yet available.
    inputRef.current?.focus();
  }, []);

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input.trim(),
        completed: false
      }]);
      setInput('');
      inputRef.current?.focus(); // keep focus after adding
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (window.confirm(`Are you sure you want to delete "${todoToDelete.text}"?`)) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ));
      setEditingId(null);
      setEditText('');
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