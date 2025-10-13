import React, { useState, useEffect } from 'react';
import { rulesAPI } from '../services/api';

function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    points: 0
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { name: searchTerm } : {};
      const data = await rulesAPI.getAll(params);
      setRules(data);
      setError(null);
    } catch (err) {
      setError('Failed to load rules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      loadRules();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRules();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await rulesAPI.update(editingRule.id, formData);
      } else {
        await rulesAPI.create(formData);
      }
      setShowForm(false);
      setEditingRule(null);
      resetForm();
      loadRules();
    } catch (err) {
      setError('Failed to save rule');
      console.error(err);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      points: rule.points
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await rulesAPI.delete(id);
        loadRules();
      } catch (err) {
        setError('Failed to delete rule');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      points: 0
    });
  };

  if (loading) return <div className="loading">Loading rules...</div>;

  return (
    <div>
      <div className="card">
        <h2>Rules Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search rules by name..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button type="submit" className="btn">Search</button>
          </form>
        </div>
        
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingRule(null);
            resetForm();
          }}
        >
          Add New Rule
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingRule ? 'Edit Rule' : 'Add New Rule'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingRule(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Rules List</h3>
        {rules.length === 0 ? (
          <p>No rules found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Points</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td>{rule.name}</td>
                  <td>{rule.type}</td>
                  <td>{rule.points}</td>
                  <td>{rule.description}</td>
                  <td>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(rule)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(rule.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Rules;
