import React, { useState, useEffect, useCallback, useRef } from 'react';
import { wargearAPI } from '../services/api';
import { Icon } from './Icons';

function WarGear() {
  const [wargear, setWargear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWarGear, setEditingWarGear] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    points: 0,
    rules: []
  });

  const loadWarGear = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await wargearAPI.getAll(params);
      setWargear(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load wargear');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadWarGear('');
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
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search is empty, load immediately
    if (value === '') {
      loadWarGear('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadWarGear(value, false);
      }, 300);
    }
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
      loadWarGear(searchTerm, false);
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
      rules: wargearItem.rules || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wargear?')) {
      try {
        await wargearAPI.delete(id);
        loadWarGear(searchTerm, false);
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
      rules: []
    });
  };

  if (loading) return <div className="loading">Loading wargear...</div>;

  return (
    <div>
      <div className="card">
        <h2>WarGear Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search wargear by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
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
        {!wargear || wargear.length === 0 ? (
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
              {wargear && wargear.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.points}</td>
                  <td>{item.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(item)}
                        style={{ 
                          cursor: 'pointer', 
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#21262d';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Icon name="edit" size={20} color="#8b949e" />
                      </div>
                      <div 
                        onClick={() => handleDelete(item.id)}
                        style={{ 
                          cursor: 'pointer', 
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#21262d';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Icon name="delete" size={20} color="#f85149" />
                      </div>
                    </div>
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
