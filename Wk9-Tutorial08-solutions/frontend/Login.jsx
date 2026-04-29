import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();
    if (email.trim() && password.trim()) {
      try {
        const response = await fetch(API_BASE_URL + '/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password
          }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          // Navigate to the home (todos) page upon successful login
          sessionStorage.setItem('user', data.user); // Store the user in localStorage
          navigate('/'); // Use navigate to go to the target page
        } else {
          alert("Login failed. Please check your credentials.");
        }
      } catch (error) {
        alert("Error logging in.", error);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Manage your tasks efficiently</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account? <a href="#signup">Sign Up</a></span>
        </div>
      </div>
    </div>
  );
};

export default Login;