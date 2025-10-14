import React, { useState, useEffect, useCallback, useRef } from 'react';
import { weaponsAPI, rulesAPI } from '../services/api';
import { Icon } from './Icons';
import WeaponPointsCalculator from './WeaponPointsCalculator';

function Weapons() {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
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
  const [ruleSuggestions, setRuleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const baseWeaponPointsRef = useRef(0);
  const [showWeaponPointsCalculator, setShowWeaponPointsCalculator] = useState(false);

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
    
    // Load suggestions for autocomplete
    loadRuleSuggestions(query);
    
    // Load full results if query is long enough
    if (query.length > 2) {
      loadRules(query);
    } else {
      setAvailableRules([]);
    }
  };

  const handleRuleSelect = async (rule, tier = 1) => {
    try {
      // Add rule to weapon using the new API
      if (editingWeapon) {
        await weaponsAPI.addRule(editingWeapon.id, rule.id, tier);
        // Reload the weapon to get updated data
        const updatedWeapon = await weaponsAPI.getWithRules(editingWeapon.id);
        setFormData(prev => ({
          ...prev,
          points: updatedWeapon.totalPoints
        }));
        // Update selected rules to show the newly added rule
        setSelectedRules(updatedWeapon.weapon.populatedRules || []);
      } else {
        // For new weapons, add to selected rules with tier information
        setSelectedRules(prev => [...prev, { ...rule, tier: tier }]);
      }
      setShowRuleSelector(false);
      setRuleSearchTerm('');
      setShowSuggestions(false);
    } catch (err) {
      console.error('Failed to add rule to weapon:', err);
    }
  };

  // Load initial rules when dialog opens
  useEffect(() => {
    if (showRuleSelector) {
      loadRules(''); // Load all rules initially
    }
  }, [showRuleSelector, loadRules]);

  const handleSuggestionSelect = (rule) => {
    setRuleSearchTerm(rule.name);
    setShowSuggestions(false);
    // Load the full rule details
    loadRules(rule.name);
  };

  const handleRuleRemove = async (ruleId) => {
    try {
      if (editingWeapon) {
        // Remove rule from weapon using the new API
        await weaponsAPI.removeRule(editingWeapon.id, ruleId);
        // Reload the weapon to get updated data
        const updatedWeapon = await weaponsAPI.getWithRules(editingWeapon.id);
        setFormData(prev => ({
          ...prev,
          points: updatedWeapon.totalPoints
        }));
        // Update selected rules to reflect the removal
        setSelectedRules(updatedWeapon.weapon.populatedRules || []);
      } else {
        // For new weapons, remove from selected rules
        setSelectedRules(prev => prev.filter(rule => rule.id !== ruleId));
      }
    } catch (err) {
      console.error('Failed to remove rule from weapon:', err);
    }
  };

  const calculateTotalPoints = () => {
    const basePoints = baseWeaponPointsRef.current || 0;
    const rulePoints = selectedRules.reduce((total, rule) => {
      const points = rule.points || [];
      if (rule.tier && rule.tier >= 1 && rule.tier <= points.length) {
        return total + (points[rule.tier - 1] || 0); // Use tier-specific points
      } else {
        return total + (points[0] || 0); // Default to tier 1
      }
    }, 0);
    return basePoints + rulePoints;
  };

  const handleWeaponPointsCalculated = (points) => {
    setFormData(prev => ({
      ...prev,
      points: points
    }));
    setShowWeaponPointsCalculator(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedWeapons = () => {
    if (!weapons || weapons.length === 0) return [];
    
    return [...weapons].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle numeric fields
      if (sortField === 'range' || sortField === 'attacks' || sortField === 'points') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Update base weapon points when form data changes and no rules are selected
  useEffect(() => {
    if (selectedRules.length === 0) {
      baseWeaponPointsRef.current = formData.points || 0;
    }
  }, [formData.points, selectedRules.length]);

  // Update total points whenever selectedRules changes
  useEffect(() => {
    const rulePoints = selectedRules.reduce((total, rule) => {
      const points = rule.points || [];
      return total + (points[0] || 0); // Use tier 1 points
    }, 0);
    const totalPoints = baseWeaponPointsRef.current + rulePoints;
    
    setFormData(prev => ({
      ...prev,
      points: totalPoints
    }));
  }, [selectedRules]);

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

  const handleEdit = async (weapon) => {
    try {
      // Load weapon with populated rules
      const weaponWithRules = await weaponsAPI.getWithRules(weapon.id);
      
      setEditingWeapon(weapon);
      setFormData({
        name: weapon.name,
        type: weapon.type,
        range: weapon.range,
        ap: weapon.ap,
        attacks: weapon.attacks,
        abilities: weapon.abilities,
        points: weaponWithRules.totalPoints
      });
      
      // Set selected rules from populated data
      setSelectedRules(weaponWithRules.weapon.populatedRules || []);
      
      setShowForm(true);
    } catch (err) {
      console.error('Failed to load weapon with rules:', err);
      // Fallback to original weapon data
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
    }
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
                    
                    {/* Rule Tags */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      {selectedRules.map(rule => (
                        <div
                          key={rule.id}
                          style={{
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            position: 'relative',
                            cursor: 'default'
                          }}
                          title={rule.description} // Hover tooltip
                        >
                          <span style={{ color: '#f0f6fc' }}>
                            {rule.name}
                          </span>
                          {rule.points && rule.points.length > 0 && (
                            <span style={{ 
                              color: '#58a6ff', 
                              fontSize: '0.75rem',
                              backgroundColor: '#0d1117',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '10px'
                            }}>
                              {(() => {
                                if (rule.tier && rule.tier >= 1 && rule.tier <= rule.points.length) {
                                  return rule.points[rule.tier - 1];
                                } else {
                                  return rule.points[0]; // Default to tier 1
                                }
                              })()}
                            </span>
                          )}
                          {rule.tier && (
                            <span style={{ 
                              color: '#f0f6fc', 
                              fontSize: '0.7rem',
                              backgroundColor: '#30363d',
                              padding: '0.1rem 0.3rem',
                              borderRadius: '8px',
                              marginLeft: '0.25rem'
                            }}>
                              T{rule.tier}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRuleRemove(rule.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#f85149',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '0.1rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%'
                            }}
                            title="Remove rule"
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f85149'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Applied Rules Display */}
                {formData.abilities && formData.abilities.includes('(') && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>Applied Rules:</h4>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#0d1117',
                      borderRadius: '6px',
                      border: '1px solid #30363d',
                      color: '#8b949e',
                      fontSize: '0.85rem'
                    }}>
                      {formData.abilities}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Points</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    style={{
                      backgroundColor: selectedRules.length > 0 ? '#21262d' : undefined,
                      color: selectedRules.length > 0 ? '#8b949e' : undefined,
                      cursor: selectedRules.length > 0 ? 'not-allowed' : undefined,
                      flex: 1
                    }}
                    readOnly={selectedRules.length > 0}
                    title={selectedRules.length > 0 ? 'Points automatically calculated from base weapon + attached rules' : 'Enter base weapon points'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWeaponPointsCalculator(true)}
                    style={{
                      backgroundColor: '#58a6ff',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                    title="Calculate points based on weapon stats"
                  >
                    Calculate
                  </button>
                </div>
                {selectedRules.length > 0 && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#8b949e', 
                    marginTop: '0.25rem' 
                  }}>
                    Auto-calculated: Base weapon + rule points
                  </div>
                )}
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
                <th 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('type')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('range')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Range {sortField === 'range' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('ap')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  AP {sortField === 'ap' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('attacks')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Attacks {sortField === 'attacks' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('points')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Points {sortField === 'points' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedWeapons().map(weapon => (
                <tr key={weapon.id}>
                  <td><strong>{weapon.name}</strong></td>
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
            
            {selectedRules.length > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#21262d',
                borderRadius: '6px',
                border: '1px solid #30363d'
              }}>
                <div style={{ color: '#58a6ff', fontSize: '0.85rem' }}>
                  <div>Rule Points: +{selectedRules.reduce((total, rule) => total + (rule.points?.[0] || 0), 0)}</div>
                  <div style={{ color: '#f0f6fc', marginTop: '0.25rem' }}>
                    Total Weapon Points: {calculateTotalPoints()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Back Button */}
            <div style={{ 
              marginTop: '1rem', 
              display: 'flex', 
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowRuleSelector(false)}
                style={{
                  backgroundColor: '#6e7681',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#8b949e'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6e7681'}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weapon Points Calculator */}
      {showWeaponPointsCalculator && (
        <WeaponPointsCalculator
          weapon={formData}
          onPointsCalculated={handleWeaponPointsCalculated}
          onClose={() => setShowWeaponPointsCalculator(false)}
        />
      )}
    </div>
  );
}

export default Weapons;
