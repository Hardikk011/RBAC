import { useState } from 'react';
import api from '../api/axios';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import './CheckPermission.css';

export default function CheckPermission() {
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!userId || !permission.trim()) {
      setError('Both User ID and Permission codename are required.');
      return;
    }

    setChecking(true);
    try {
      const res = await api.get('/api/check-permission/', {
        params: { user_id: userId, permission: permission.trim() },
      });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found. Check the User ID.');
      } else {
        setError('Something went wrong while checking permission.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="check-page">
      <div className="page-heading">
        <div>
          <h2>Permission Checker</h2>
          <p>Verify if a specific user holds a given permission through their roles</p>
        </div>
      </div>

      <div className="checker-card">
        <form onSubmit={handleCheck} className="checker-form">
          <div className="checker-inputs">
            <div className="form-group">
              <label htmlFor="check-user-id">User ID</label>
              <input
                id="check-user-id"
                type="number"
                min="1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="check-perm">Permission Codename</label>
              <input
                id="check-perm"
                type="text"
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                placeholder="e.g. delete_user"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary checker-btn"
            disabled={checking}
          >
            {checking ? 'Checking...' : (
              <>
                <SearchOutlinedIcon fontSize="small" />
                Check Permission
              </>
            )}
          </button>
        </form>

        {error && <div className="checker-error">{error}</div>}
      </div>

      {/* Result card */}
      {result && (
        <div className={`result-card ${result.has_permission ? 'result--granted' : 'result--denied'}`}>
          <div className="result-icon">
            {result.has_permission
              ? <CheckCircleOutlineIcon style={{ fontSize: '4.5rem', color: '#065F46' }} />
              : <CancelOutlinedIcon style={{ fontSize: '4.5rem', color: '#991B1B' }} />
            }
          </div>
          <div className="result-status">
            {result.has_permission ? 'Permission Granted' : 'Permission Denied'}
          </div>
          <div className="result-details">
            <div className="result-row">
              <span className="result-label">User</span>
              <span className="result-value">{result.user}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Permission</span>
              <span className="result-value">{result.permission}</span>
            </div>
          </div>
          <div className="result-message">
            {result.has_permission
              ? `"${result.user}" has the "${result.permission}" permission through one of their assigned roles.`
              : `"${result.user}" does not have the "${result.permission}" permission in any of their roles.`
            }
          </div>
        </div>
      )}
    </div>
  );
}
