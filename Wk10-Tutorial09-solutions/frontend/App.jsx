import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import TodoApp from './TodoApp';

const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem('user');
  return !user ? <Navigate to="/login" replace /> : children;
};

const ProtectedLoginRoute = ({ children }) => {
  const user = sessionStorage.getItem('user');
  return user ? <Navigate to="/" replace /> : children;
}

function NoMatch() {
  return (
    <div style={{ padding: 20 }}>
      <h2>404: Page Not Found</h2>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><TodoApp /></ProtectedRoute>} />
        <Route path="/login" element={<ProtectedLoginRoute><Login /></ProtectedLoginRoute>} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}