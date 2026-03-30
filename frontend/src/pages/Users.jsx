import { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // form states
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users/');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/roles/');
      setAllRoles(res.data);
    } catch (err) {
      console.error('Could not fetch roles:', err);
    }
  };

  // ─── Create user ──────────────────────────────────

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newUser.username || !newUser.email || !newUser.password) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await api.post('/api/register/', newUser);
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const messages = Object.entries(detail)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setFormError(messages);
      } else {
        setFormError('Failed to create user.');
      }
    }
  };

  // ─── Assign roles ─────────────────────────────────

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles.map((r) => r.id));
    setShowRoleModal(true);
    setFormError('');
  };

  const toggleRoleSelection = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/api/users/${selectedUser.id}/assign_roles/`, {
        role_ids: selectedRoleIds,
      });
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      setFormError('Failed to assign roles.');
    }
  };

  // ─── Delete user ──────────────────────────────────

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  // ─── Table columns ────────────────────────────────

  const roleVariants = ['indigo', 'cyan', 'emerald', 'rose', 'amber'];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'roles',
      label: 'Roles',
      render: (row) =>
        row.roles.length > 0 ? (
          row.roles.map((role, i) => (
            <Badge key={role.id} text={role.name} variant={roleVariants[i % roleVariants.length]} />
          ))
        ) : (
          <span className="text-muted">No roles</span>
        ),
    },
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
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="action-btns">
          <button className="btn-sm btn-outline" onClick={() => openRoleModal(row)}>
            <AssignmentIndOutlinedIcon style={{ fontSize: '1rem' }} />
            Assign Roles
          </button>
          <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(row.id, row.username)}>
            <DeleteOutlineIcon style={{ fontSize: '1rem' }} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="users-page">
      <div className="page-heading">
        <div>
          <h2>Users</h2>
          <p>Manage user accounts and their role assignments</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowCreateModal(true); setFormError(''); }}>
          <PersonAddOutlinedIcon fontSize="small" />
          Add User
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="section-card">
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found. Create one to get started." />
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label htmlFor="new-username">Username</label>
            <input
              id="new-username"
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="johndoe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-email">Email</label>
            <input
              id="new-email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Password</label>
            <input
              id="new-password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Minimum 8 characters"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Create User
          </button>
        </form>
      </Modal>

      {/* Assign Roles Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={`Assign Roles — ${selectedUser?.username}`}>
        <div className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          {allRoles.length === 0 ? (
            <p className="text-muted">No roles available. Create some first.</p>
          ) : (
            <div className="checkbox-list">
              {allRoles.map((role) => (
                <label key={role.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => toggleRoleSelection(role.id)}
                  />
                  <div>
                    <strong>{role.name}</strong>
                    {role.description && <span className="checkbox-desc">{role.description}</span>}
                  </div>
                </label>
              ))}
            </div>
          )}
          <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={handleAssignRoles}>
            Save Roles
          </button>
        </div>
      </Modal>
    </div>
  );
}
