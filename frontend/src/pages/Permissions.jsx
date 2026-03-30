import { useState, useEffect } from 'react';
import api from '../api/axios';
import Table from '../components/Table';
import Modal from '../components/Modal';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './Permissions.css';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null);
  const [formData, setFormData] = useState({ codename: '', description: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/permissions/');
      setPermissions(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPerm(null);
    setFormData({ codename: '', description: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (perm) => {
    setEditingPerm(perm);
    setFormData({ codename: perm.codename, description: perm.description });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.codename.trim()) {
      setFormError('Codename is required.');
      return;
    }

    try {
      if (editingPerm) {
        await api.put(`/api/permissions/${editingPerm.id}/`, formData);
      } else {
        await api.post('/api/permissions/', formData);
      }
      setShowModal(false);
      fetchPermissions();
    } catch (err) {
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const messages = Object.entries(detail)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
        setFormError(messages);
      } else {
        setFormError('Failed to save permission.');
      }
    }
  };

  const handleDelete = async (permId, codename) => {
    if (!window.confirm(`Delete permission "${codename}"?`)) return;
    try {
      await api.delete(`/api/permissions/${permId}/`);
      fetchPermissions();
    } catch (err) {
      alert('Failed to delete permission.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'codename', label: 'Codename' },
    { key: 'description', label: 'Description' },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
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
          <button className="btn-sm btn-danger" onClick={() => handleDelete(row.id, row.codename)}>
            <DeleteOutlineIcon style={{ fontSize: '1rem' }} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="permissions-page">
      <div className="page-heading">
        <div>
          <h2>Permissions</h2>
          <p>Define granular access permissions for your application</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <AddCircleOutlineIcon fontSize="small" />
          Add Permission
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="section-card">
        <Table columns={columns} data={permissions} loading={loading} emptyMessage="No permissions defined yet." />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPerm ? `Edit Permission — ${editingPerm.codename}` : 'Create New Permission'}
      >
        <form onSubmit={handleSave} className="modal-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-group">
            <label htmlFor="perm-code">Codename</label>
            <input
              id="perm-code"
              type="text"
              value={formData.codename}
              onChange={(e) => setFormData({ ...formData, codename: e.target.value })}
              placeholder="e.g. edit_report"
            />
          </div>
          <div className="form-group">
            <label htmlFor="perm-desc">Description</label>
            <textarea
              id="perm-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this permission allow?"
              rows={3}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            {editingPerm ? 'Update Permission' : 'Create Permission'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
