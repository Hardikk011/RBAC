import { useAuth } from '../context/AuthContext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-context">Access Control</h1>
      </div>

      <div className="navbar-right">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user?.username || 'User'}</span>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogoutOutlinedIcon fontSize="small" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
