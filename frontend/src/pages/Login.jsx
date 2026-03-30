import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrap">
            <LockOutlinedIcon style={{ fontSize: '2.5rem', color: '#81A6C6' }} />
          </div>
          <h1>RBAC Dashboard</h1>
          <p>Sign in to manage users, roles, and permissions</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : (
              <>
                <LoginOutlinedIcon fontSize="small" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-hint">
          <p>Demo credentials: <strong>admin</strong> / <strong>admin1234</strong></p>
        </div>
      </div>
    </div>
  );
}
