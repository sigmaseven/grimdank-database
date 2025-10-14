import React, { useState, useEffect, useCallback, useRef } from 'react';
import { weaponsAPI, rulesAPI } from '../services/api';
import { Icon } from './Icons';

function Weapons() {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    range: 0,
    ap: '',
    attacks: '',
    abilities: '',
    points: 0
  });

  // Rule attachment system
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);

  const loadWeapons = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await weaponsAPI.getAll(params);
      setWeapons(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load weapons');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
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
    } finally {
      setRuleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeapons('');
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
      loadWeapons('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadWeapons(value, false);
      }, 300);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' || name === 'range' ? parseInt(value) || 0 : value
    }));
  };

  const handleRuleSearch = (e) => {
    const query = e.target.value;
    setRuleSearchTerm(query);
    if (query.length > 2) {
      loadRules(query);
    }
  };

  const handleRuleSelect = (rule) => {
    setSelectedRules(prev => [...prev, rule]);
    setShowRuleSelector(false);
    setRuleSearchTerm('');
  };

  const handleRuleRemove = (ruleId) => {
    setSelectedRules(prev => prev.filter(rule => rule._id !== ruleId));
  };

  const calculateTotalPoints = () => {
    const basePoints = formData.points || 0;
    const rulePoints = selectedRules.reduce((total, rule) => {
      const points = rule.points || [];
      return total + (points[0] || 0); // Use tier 1 points
    }, 0);
    return basePoints + rulePoints;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWeapon) {
        await weaponsAPI.update(editingWeapon.id, formData);
      } else {
        await weaponsAPI.create(formData);
      }
      setShowForm(false);
      setEditingWeapon(null);
      resetForm();
      loadWeapons(searchTerm, false);
    } catch (err) {
      setError('Failed to save weapon');
      console.error(err);
    }
  };

  const handleEdit = (weapon) => {
    setEditingWeapon(weapon);
    setFormData({
      name: weapon.name,
      type: weapon.type,
      range: weapon.range,
      ap: weapon.ap,
      attacks: weapon.attacks,
      abilities: weapon.abilities,
      points: weapon.points
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this weapon?')) {
      try {
        await weaponsAPI.delete(id);
        loadWeapons(searchTerm, false);
      } catch (err) {
        setError('Failed to delete weapon');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      range: 0,
      ap: '',
      attacks: '',
      abilities: '',
      points: 0
    });
  };

  if (loading) return <div className="loading">Loading weapons...</div>;

  return (
    <div>
      <div className="card">
        <h2>Weapons Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search weapons by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingWeapon(null);
            resetForm();
          }}
        >
          Add New Weapon
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingWeapon ? 'Edit Weapon' : 'Add New Weapon'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingWeapon(null);
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
                  <option value="">Select Type</option>
                  <option value="Ranged">Ranged</option>
                  <option value="Melee">Melee</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Range (inches)</label>
                  <input
                    type="number"
                    name="range"
                    value={formData.range}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>AP</label>
                  <input
                    type="text"
                    name="ap"
                    value={formData.ap}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Attacks</label>
                  <input
                    type="text"
                    name="attacks"
                    value={formData.attacks}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Rules</label>
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowRuleSelector(true)}
                    style={{
                      backgroundColor: '#238636',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    + Attach Rules
                  </button>
                </div>
                
                {selectedRules.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>Attached Rules:</h4>
                    {selectedRules.map(rule => (
                      <div key={rule._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#21262d',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #30363d'
                      }}>
                        <div>
                          <strong style={{ color: '#f0f6fc' }}>{rule.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                            {rule.points && rule.points.length > 0 ? 
                              `${rule.points[0]}/${rule.points[1]}/${rule.points[2]} pts` : 
                              'No points calculated'
                            }
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRuleRemove(rule._id)}
                          style={{
                            backgroundColor: '#da3633',
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
                    <div style={{
                      padding: '0.5rem',
                      backgroundColor: '#161b22',
                      borderRadius: '4px',
                      border: '1px solid #30363d',
                      marginTop: '0.5rem'
                    }}>
                      <strong style={{ color: '#f0f6fc' }}>
                        Total Points: {calculateTotalPoints()}
                      </strong>
                    </div>
                  </div>
                )}
                
                <textarea
                  name="abilities"
                  value={formData.abilities}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional rule descriptions or notes..."
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
                  {editingWeapon ? 'Update Weapon' : 'Create Weapon'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingWeapon(null);
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
        <h3>Weapons List</h3>
        {!weapons || weapons.length === 0 ? (
          <p>No weapons found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Range</th>
                <th>AP</th>
                <th>Attacks</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {weapons && weapons.map(weapon => (
                <tr key={weapon.id}>
                  <td>{weapon.name}</td>
                  <td>{weapon.type}</td>
                  <td>{weapon.range}"</td>
                  <td>{weapon.ap}</td>
                  <td>{weapon.attacks}</td>
                  <td>{weapon.points}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(weapon)}
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
                        onClick={() => handleDelete(weapon.id)}
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

      {/* Rule Selector - appears on top of weapon form */}
      {showRuleSelector && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
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
            
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search rules by name or description..."
                value={ruleSearchTerm}
                onChange={handleRuleSearch}
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
                  <div key={rule._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#21262d',
                    borderRadius: '6px',
                    border: '1px solid #30363d',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onClick={() => handleRuleSelect(rule)}
                  onMouseEnter={(e) => e.target.style.borderColor = '#58a6ff'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#30363d'}
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
                    <button
                      style={{
                        backgroundColor: '#238636',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                    >
                      Attach
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#21262d',
              borderRadius: '6px',
              border: '1px solid #30363d'
            }}>
              <div style={{ color: '#f0f6fc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Selected Rules: {selectedRules.length}</strong>
              </div>
              {selectedRules.length > 0 && (
                <div style={{ color: '#58a6ff', fontSize: '0.85rem' }}>
                  Total Additional Points: {selectedRules.reduce((total, rule) => total + (rule.points?.[0] || 0), 0)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weapons;
