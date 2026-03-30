import { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/Table';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, roles: 0, permissions: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        api.get('/api/users/'),
        api.get('/api/roles/'),
        api.get('/api/permissions/'),
      ]);

      setStats({
        users: usersRes.data.length,
        roles: rolesRes.data.length,
        permissions: permsRes.data.length,
      });

      const sorted = usersRes.data
        .sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
        .slice(0, 5);
      setRecentUsers(sorted);
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the server is running.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: <PeopleOutlineIcon /> },
    { label: 'Total Roles', value: stats.roles, icon: <VpnKeyOutlinedIcon /> },
    { label: 'Total Permissions', value: stats.permissions, icon: <ShieldOutlinedIcon /> },
  ];

  const recentColumns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <span className={`status-dot ${row.is_active ? 'active' : 'inactive'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'date_joined',
      label: 'Joined',
      render: (row) => new Date(row.date_joined).toLocaleDateString(),
    },
  ];

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="page-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your access control system</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon">
              {card.icon}
            </div>
            <div className="stat-content">
              <span className="stat-value">{loading ? '—' : card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <h3>Recent Users</h3>
        <Table columns={recentColumns} data={recentUsers} loading={loading} emptyMessage="No users yet." />
      </div>
    </div>
  );
}
