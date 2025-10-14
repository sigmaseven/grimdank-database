import React, { useState, useEffect, useCallback } from 'react';
import { wargearAPI } from '../services/api';

function WarGear() {
  const [wargear, setWargear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWarGear, setEditingWarGear] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    points: 0,
    rules: [],
    weapons: []
  });

  const loadWarGear = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { name: searchTerm } : {};
      const data = await wargearAPI.getAll(params);
      setWargear(data);
      setError(null);
    } catch (err) {
      setError('Failed to load wargear');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadWarGear();
  }, [loadWarGear]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      loadWarGear();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadWarGear();
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
      if (editingWarGear) {
        await wargearAPI.update(editingWarGear.id, formData);
      } else {
        await wargearAPI.create(formData);
      }
      setShowForm(false);
      setEditingWarGear(null);
      resetForm();
      loadWarGear();
    } catch (err) {
      setError('Failed to save wargear');
      console.error(err);
    }
  };

  const handleEdit = (wargearItem) => {
    setEditingWarGear(wargearItem);
    setFormData({
      name: wargearItem.name,
      type: wargearItem.type,
      description: wargearItem.description,
      points: wargearItem.points,
      rules: wargearItem.rules || [],
      weapons: wargearItem.weapons || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wargear?')) {
      try {
        await wargearAPI.delete(id);
        loadWarGear();
      } catch (err) {
        setError('Failed to delete wargear');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      points: 0,
      rules: [],
      weapons: []
    });
  };

  if (loading) return <div className="loading">Loading wargear...</div>;

  return (
    <div>
      <div className="card">
        <h2>WarGear Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search wargear by name..."
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
            setEditingWarGear(null);
            resetForm();
          }}
        >
          Add New WarGear
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingWarGear ? 'Edit WarGear' : 'Add New WarGear'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingWarGear(null);
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
                <label>Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
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
                  {editingWarGear ? 'Update WarGear' : 'Create WarGear'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingWarGear(null);
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
        <h3>WarGear List</h3>
        {wargear.length === 0 ? (
          <p>No wargear found.</p>
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
              {wargear.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.points}</td>
                  <td>{item.description}</td>
                  <td>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(item.id)}
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

export default WarGear;
