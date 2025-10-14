import React, { useState, useEffect, useCallback, useRef } from 'react';
import { wargearAPI, rulesAPI } from '../services/api';
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

  const [selectedRules, setSelectedRules] = useState([]);
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [availableRules, setAvailableRules] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [ruleLoading, setRuleLoading] = useState(false);
  const [ruleSuggestions, setRuleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    setSelectedRules(wargearItem.populatedRules || []);
    setShowForm(true);
  };

  const loadAvailableRules = useCallback(async () => {
    try {
      const data = await rulesAPI.getAll();
      setAvailableRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load rules:', err);
    }
  }, []);

  const loadRules = useCallback(async (searchQuery = '') => {
    try {
      setRuleLoading(true);
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await rulesAPI.getAll(params);
      setAvailableRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setAvailableRules([]);
    } finally {
      setRuleLoading(false);
    }
  }, []);

  const loadRuleSuggestions = useCallback(async (searchQuery = '') => {
    try {
      if (searchQuery.length >= 2) {
        const params = { name: searchQuery, limit: 5 };
        const data = await rulesAPI.getAll(params);
        setRuleSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } else {
        setRuleSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Failed to load rule suggestions:', err);
    }
  }, []);

  const handleRuleSearch = (e) => {
    const query = e.target.value;
    setRuleSearchTerm(query);
    
    // Load suggestions for autocomplete
    loadRuleSuggestions(query);
    
    // Load full results if query is long enough
    if (query.length > 2) {
      loadRules(query);
    } else {
      setAvailableRules([]);
    }
  };

  const handleSuggestionSelect = (rule) => {
    setRuleSearchTerm(rule.name);
    setShowSuggestions(false);
    // Load the full rule details
    loadRules(rule.name);
  };

  // Load initial rules when dialog opens
  useEffect(() => {
    if (showRuleSelector) {
      loadRules(''); // Load all rules initially
    }
  }, [showRuleSelector, loadRules]);

  const handleRuleSelect = async (rule, tier = 1) => {
    if (editingWarGear) {
      // For existing wargear, add rule via API
      try {
        const updatedWarGear = await wargearAPI.addRule(editingWarGear.id, rule.id, tier);
        setSelectedRules(updatedWarGear.wargear.populatedRules || []);
      } catch (err) {
        console.error('Failed to add rule:', err);
      }
    } else {
      // For new wargear, add to local state
      setSelectedRules(prev => [...prev, { ...rule, tier: tier }]);
    }
    setShowRuleSelector(false);
  };

  const handleRuleRemove = async (ruleId) => {
    if (editingWarGear) {
      // For existing wargear, remove rule via API
      try {
        const updatedWarGear = await wargearAPI.removeRule(editingWarGear.id, ruleId);
        setSelectedRules(updatedWarGear.wargear.populatedRules || []);
      } catch (err) {
        console.error('Failed to remove rule:', err);
      }
    } else {
      // For new wargear, remove from local state
      setSelectedRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const calculateTotalPoints = () => {
    let basePoints = parseInt(formData.points) || 0;
    let rulePoints = 0;
    
    selectedRules.forEach(rule => {
      if (rule.points && rule.points.length > 0) {
        const tier = rule.tier || 1;
        if (tier >= 1 && tier <= rule.points.length) {
          rulePoints += rule.points[tier - 1];
        } else {
          rulePoints += rule.points[0];
        }
      }
    });
    
    return basePoints + rulePoints;
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
    setSelectedRules([]);
    setEditingWarGear(null);
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

              <div className="form-group">
                <label>Rules</label>
                <div style={{ marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRuleSelector(true);
                    }}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Rule
                  </button>
                </div>
                
                {selectedRules.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {selectedRules.map((rule) => (
                      <div
                        key={rule.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#f8f9fa',
                          padding: '0.5rem',
                          margin: '0.25rem 0',
                          borderRadius: '4px',
                          border: '1px solid #dee2e6'
                        }}
                      >
                        <div>
                          <strong>{rule.name}</strong>
                          {rule.points && rule.points.length > 0 && (
                            <span style={{ marginLeft: '0.5rem', color: '#6c757d' }}>
                              (Tier {rule.tier || 1}: {(() => {
                                const tier = rule.tier || 1;
                                return rule.points[tier - 1] || rule.points[0] || 0;
                              })()} pts)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRuleRemove(rule.id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedRules.length > 0 && (
                  <div style={{ 
                    background: '#e9ecef', 
                    padding: '0.75rem', 
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}>
                    <strong>Total Points: {calculateTotalPoints()}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      Base: {formData.points} + Rules: {calculateTotalPoints() - (parseInt(formData.points) || 0)}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  {editingWarGear ? 'Update WarGear' : 'Create WarGear'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
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

      {/* Rule Selector Modal */}
      {showRuleSelector && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRuleSelector(false);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#f0f6fc', margin: 0 }}>Select Rules to Attach</h3>
              <button
                onClick={() => setShowRuleSelector(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f0f6fc',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search rules by name or description..."
                value={ruleSearchTerm}
                onChange={handleRuleSearch}
                onFocus={() => {
                  if (ruleSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#f0f6fc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                autoFocus
              />
              
              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && ruleSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  marginTop: '0.25rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                  zIndex: 10000,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                }}>
                  {ruleSuggestions.map(rule => (
                    <div
                      key={rule.id}
                      onClick={() => handleSuggestionSelect(rule)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #30363d',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#30363d'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ color: '#f0f6fc', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {rule.name}
                      </div>
                      <div style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        {rule.description}
                      </div>
                      {rule.points && rule.points.length > 0 && (
                        <div style={{ color: '#58a6ff', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {rule.points[0]}/{rule.points[1]}/{rule.points[2]} pts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {ruleLoading ? (
                <div style={{ textAlign: 'center', color: '#8b949e', padding: '2rem' }}>Loading rules...</div>
              ) : availableRules.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8b949e', padding: '2rem' }}>
                  {ruleSearchTerm ? 'No rules found matching your search.' : 'Start typing to search for rules.'}
                </div>
              ) : (
                availableRules.map(rule => (
                  <div key={rule.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#21262d',
                    borderRadius: '6px',
                    border: '1px solid #30363d',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#30363d'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#f0f6fc', fontWeight: 'bold', marginBottom: '0.25rem' }}>{rule.name}</div>
                      <div style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{rule.description}</div>
                      {rule.points && rule.points.length > 0 && (
                        <div style={{ color: '#58a6ff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Points: {rule.points[0]}/{rule.points[1]}/{rule.points[2]} (Tier 1/2/3)
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      {rule.points && rule.points.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3].map(tier => (
                            <button
                              key={tier}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRuleSelect(rule, tier);
                              }}
                              style={{
                                backgroundColor: '#238636',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s ease',
                                minWidth: '40px'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                              title={`Tier ${tier}: ${rule.points[tier-1]} points`}
                            >
                              T{tier}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRuleSelect(rule, 1);
                          }}
                          style={{
                            backgroundColor: '#238636',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                        >
                          Attach
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                  <td><strong>{item.name}</strong></td>
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
