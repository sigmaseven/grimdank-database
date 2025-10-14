import React, { useState, useEffect, useCallback, useRef } from 'react';
import { factionsAPI } from '../services/api';
import { Icon } from './Icons';

function Factions() {
  const [factions, setFactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFaction, setEditingFaction] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Official'
  });

  const loadFactions = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await factionsAPI.getAll(params);
      setFactions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load factions');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadFactions('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      loadFactions(query, false);
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaction) {
        await factionsAPI.update(editingFaction.id, formData);
      } else {
        await factionsAPI.create(formData);
      }
      setShowForm(false);
      setEditingFaction(null);
      resetForm();
      loadFactions(searchTerm, false);
    } catch (err) {
      setError('Failed to save faction');
      console.error(err);
    }
  };

  const handleEdit = (faction) => {
    setEditingFaction(faction);
    setFormData({
      name: faction.name,
      description: faction.description,
      type: faction.type
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faction?')) {
      try {
        await factionsAPI.delete(id);
        loadFactions(searchTerm, false);
      } catch (err) {
        setError('Failed to delete faction');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'Official'
    });
    setEditingFaction(null);
  };

  if (loading) return <div className="loading">Loading factions...</div>;

  return (
    <div>
      <div className="card">
        <h2>Faction Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search factions by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button 
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Faction
        </button>
      </div>

      <div className="card">
        <h3>Factions List</h3>
        {!factions || factions.length === 0 ? (
          <p>No factions found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factions.map(faction => (
                <tr key={faction.id}>
                  <td><strong>{faction.name}</strong></td>
                  <td>
                    <span className={`badge ${faction.type === 'Official' ? 'badge-primary' : 'badge-secondary'}`}>
                      {faction.type}
                    </span>
                  </td>
                  <td>{faction.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(faction)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(faction.id)}
                    >
                      <Icon name="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingFaction ? 'Edit Faction' : 'Add New Faction'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingFaction(null);
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
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="Official">Official</option>
                  <option value="Custom">Custom</option>
                </select>
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

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  {editingFaction ? 'Update Faction' : 'Create Faction'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingFaction(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Factions;
