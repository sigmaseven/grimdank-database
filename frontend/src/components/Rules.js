import React, { useState, useEffect, useCallback, useRef } from 'react';
import { rulesAPI } from '../services/api';
import { Icon } from './Icons';

function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    points: [0, 0, 0]
  });

  const [validationErrors, setValidationErrors] = useState({});

  const loadRules = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await rulesAPI.getAll(params);
      setRules(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load rules');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadRules('');
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
      loadRules('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadRules(value, false);
      }, 300);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePointsChange = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      points: newPoints
    }));
    
    // Clear validation error for points when user starts typing
    if (validationErrors.points) {
      setValidationErrors(prev => ({
        ...prev,
        points: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.type) {
      errors.type = 'Type is required';
    }
    
    if (!formData.points || formData.points.length !== 3) {
      errors.points = 'Points must have exactly 3 values';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingRule) {
        await rulesAPI.update(editingRule.id, formData);
      } else {
        await rulesAPI.create(formData);
      }
      setShowForm(false);
      setEditingRule(null);
      resetForm();
      setValidationErrors({});
      loadRules(searchTerm, false);
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
      points: rule.points || [0, 0, 0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await rulesAPI.delete(id);
        loadRules(searchTerm, false);
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
      points: [0, 0, 0]
    });
    setValidationErrors({});
  };

  if (loading) return <div className="loading">Loading rules...</div>;

  return (
    <div>
      <div className="card">
        <h2>Rules Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search rules by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
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
                  className={validationErrors.name ? 'error' : ''}
                />
                {validationErrors.name && (
                  <div className="error-message">{validationErrors.name}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className={validationErrors.description ? 'error' : ''}
                />
                {validationErrors.description && (
                  <div className="error-message">{validationErrors.description}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className={validationErrors.type ? 'error' : ''}
                >
                  <option value="">Select Type</option>
                  <option value="Unit">Unit</option>
                  <option value="Weapon">Weapon</option>
                  <option value="WarGear">WarGear</option>
                </select>
                {validationErrors.type && (
                  <div className="error-message">{validationErrors.type}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Points (3-tiered) *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Tier 1</label>
                    <input
                      type="number"
                      value={formData.points[0]}
                      onChange={(e) => handlePointsChange(0, e.target.value)}
                      min="0"
                      style={{ width: '60px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Tier 2</label>
                    <input
                      type="number"
                      value={formData.points[1]}
                      onChange={(e) => handlePointsChange(1, e.target.value)}
                      min="0"
                      style={{ width: '60px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Tier 3</label>
                    <input
                      type="number"
                      value={formData.points[2]}
                      onChange={(e) => handlePointsChange(2, e.target.value)}
                      min="0"
                      style={{ width: '60px' }}
                    />
                  </div>
                </div>
                {validationErrors.points && (
                  <div className="error-message">{validationErrors.points}</div>
                )}
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
        {!rules || rules.length === 0 ? (
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
              {rules && rules.map(rule => (
                <tr key={rule.id}>
                  <td>{rule.name}</td>
                  <td>{rule.type}</td>
                  <td>{rule.points ? rule.points.join(' / ') : '0 / 0 / 0'}</td>
                  <td>{rule.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(rule)}
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
                        onClick={() => handleDelete(rule.id)}
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

export default Rules;
