import { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './Roles.css';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/roles/');
      setRoles(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/api/permissions/');
      setAllPermissions(res.data);
    } catch (err) {
      console.error('Could not fetch permissions:', err);
    }
  };

  // ─── Open modal for create or edit ──────────────

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setSelectedPermIds([]);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description });
    setSelectedPermIds(role.permissions.map((p) => p.id));
    setFormError('');
    setShowModal(true);
  };

  // ─── Save role ─────────────────────────────────────

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Role name is required.');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      permission_ids: selectedPermIds,
    };

    try {
      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}/`, payload);
      } else {
        await api.post('/api/roles/', payload);
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const messages = Object.entries(detail)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setFormError(messages);
      } else {
        setFormError('Failed to save role.');
      }
    }
  };

  // ─── Delete role ──────────────────────────────────

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Delete role "${roleName}"?`)) return;
    try {
      await api.delete(`/api/roles/${roleId}/`);
      fetchRoles();
    } catch (err) {
      alert('Failed to delete role.');
    }
  };

  const togglePerm = (permId) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // ─── Table config ─────────────────────────────────

  const permVariants = ['cyan', 'emerald', 'amber', 'indigo', 'rose'];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Role Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (row) =>
        row.permissions.length > 0 ? (
          row.permissions.map((perm, i) => (
            <Badge key={perm.id} text={perm.codename} variant={permVariants[i % permVariants.length]} />
          ))
        ) : (
          <span className="text-muted">No permissions</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="action-btns">
          <button className="btn-sm btn-outline" onClick={() => openEditModal(row)}>
            <EditOutlinedIcon style={{ fontSize: '1rem' }} />
            Edit
          </button>
          <button className="btn-sm btn-danger" onClick={() => handleDeleteRole(row.id, row.name)}>
            <DeleteOutlineIcon style={{ fontSize: '1rem' }} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="roles-page">
      <div className="page-heading">
        <div>
          <h2>Roles</h2>
          <p>Create and manage roles with grouped permissions</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <AddCircleOutlineIcon fontSize="small" />
          Add Role
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="section-card">
        <Table columns={columns} data={roles} loading={loading} emptyMessage="No roles defined yet." />
      </div>

      {/* Create / Edit Role Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRole ? `Edit Role — ${editingRole.name}` : 'Create New Role'}
      >
        <form onSubmit={handleSaveRole} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}

          <div className="form-group">
            <label htmlFor="role-name">Role Name</label>
            <input
              id="role-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Editor"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role-desc">Description</label>
            <textarea
              id="role-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What can this role do?"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Permissions</label>
            {allPermissions.length === 0 ? (
              <p className="text-muted">No permissions available. Create some first.</p>
            ) : (
              <div className="checkbox-list">
                {allPermissions.map((perm) => (
                  <label key={perm.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedPermIds.includes(perm.id)}
                      onChange={() => togglePerm(perm.id)}
                    />
                    <div>
                      <strong>{perm.codename}</strong>
                      {perm.description && <span className="checkbox-desc">{perm.description}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            {editingRole ? 'Update Role' : 'Create Role'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
