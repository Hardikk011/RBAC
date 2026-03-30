import { NavLink } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { path: '/users', label: 'Users', icon: <PeopleOutlineIcon fontSize="small" /> },
  { path: '/roles', label: 'Roles', icon: <VpnKeyOutlinedIcon fontSize="small" /> },
  { path: '/permissions', label: 'Permissions', icon: <ShieldOutlinedIcon fontSize="small" /> },
  { path: '/check-permission', label: 'Check Access', icon: <VerifiedUserOutlinedIcon fontSize="small" /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <AdminPanelSettingsOutlinedIcon style={{ fontSize: '1.8rem', color: '#81A6C6' }} />
        <h2>RBAC Panel</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link--active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>v1.0.0</p>
      </div>
    </aside>
  );
}
