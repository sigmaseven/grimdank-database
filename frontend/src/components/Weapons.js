import React, { useState, useEffect, useCallback, useRef } from 'react';
import { weaponsAPI, rulesAPI } from '../services/api';
import { Icon } from './Icons';
import WeaponPointsCalculator from './WeaponPointsCalculator';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

function Weapons() {
  const [weapons, setWeapons] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [validationErrors, setValidationErrors] = useState({});
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    loading,
    skip,
    pageSizeOptions,
    setLoading,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    updateTotalItems,
  } = usePagination(50, [50, 100, 200]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    range: 0,
    ap: '',
    attacks: 0,
    points: 0,
    rules: []
  });

  // Rule attachment system
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);
  const baseWeaponPointsRef = useRef(0);
  const [showWeaponPointsCalculator, setShowWeaponPointsCalculator] = useState(false);

  const loadWeapons = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const response = await weaponsAPI.getAll(params);
      const data = response.data || response; // Handle both new and old format
      setWeapons(Array.isArray(data) ? data : []);
      setError(null);
      
      // Update total items count from API response
      if (response.total !== undefined) {
        updateTotalItems(response.total);
      } else {
        // Fallback to old logic if total not provided
        if (data.length === 0) {
          updateTotalItems(skip);
        } else if (data.length < pageSize) {
          updateTotalItems(skip + data.length);
        } else {
          updateTotalItems(skip + data.length + 1);
        }
      }
    } catch (err) {
      // Handle empty results gracefully - don't show error for empty lists
      console.log('Weapons API error:', err);
      setWeapons([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems, setLoading]);

  const loadRules = useCallback(async (searchQuery = '') => {
    try {
      setRuleLoading(true);
      const params = searchQuery ? { name: searchQuery, limit: 100 } : { limit: 100 };
      const data = await rulesAPI.getAll(params);
      // Filter rules for Weapons: only show rules with type "Weapon"
      const filteredRules = Array.isArray(data) ? data.filter(rule => 
        rule.type === 'Weapon'
      ) : [];
      setAvailableRules(filteredRules);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setAvailableRules([]);
    } finally {
      setRuleLoading(false);
    }
  }, []);


  useEffect(() => {
    loadWeapons(searchTerm);
  }, [searchTerm, pageSize, skip, loadWeapons]);

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
    
    // Reset pagination when searching
    resetPagination();
    
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
      [name]: name === 'points' || name === 'range' || name === 'attacks' ? parseInt(value) || 0 : value
    }));
  };

  const handleRuleSearch = (e) => {
    const query = e.target.value;
    setRuleSearchTerm(query);
    
    // Load full results based on query length
    if (query.length === 0) {
      // When search is cleared, reload all rules
      loadRules('');
    } else if (query.length > 2) {
      // Load filtered rules when query is long enough
      loadRules(query);
    } else {
      // Clear results for 1-2 character queries to avoid too many results
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
      closeRuleSelector();
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

  // Cleanup function for closing rule selector
  const closeRuleSelector = () => {
    setShowRuleSelector(false);
    setRuleSearchTerm('');
    setAvailableRules([]);
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
      // Use the selected tier, or default to tier 1
      if (rule.tier && rule.tier >= 1 && rule.tier <= points.length) {
        return total + (points[rule.tier - 1] || 0); // Use tier-specific points
      } else {
        return total + (points[0] || 0); // Default to tier 1
      }
    }, 0);
    const totalPoints = baseWeaponPointsRef.current + rulePoints;
    
    setFormData(prev => ({
      ...prev,
      points: totalPoints
    }));
  }, [selectedRules]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.type.trim()) {
      errors.type = 'Type is required';
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
      // Submit weapon data
      
      // Prepare weapon data with rules
      const weaponData = {
        ...formData,
        rules: selectedRules
          .filter(rule => rule && rule.id) // Validate rule exists and has ID
          .map(rule => ({
            ruleId: rule.id,
            tier: Math.min(3, Math.max(1, rule.tier || 1)) // Clamp tier to 1-3
          }))
      };
      
      if (editingWeapon) {
        await weaponsAPI.update(editingWeapon.id, weaponData);
      } else {
        await weaponsAPI.create(weaponData);
      }
      setError(null); // Clear any previous errors
      setValidationErrors({}); // Clear validation errors
      setShowForm(false);
      setEditingWeapon(null);
      resetForm();
      loadWeapons(searchTerm, false);
    } catch (err) {
      setError(`Failed to save weapon: ${err.response?.data?.message || err.message}`);
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
        points: weaponWithRules.totalPoints,
        rules: []
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
        points: weapon.points,
        rules: []
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this weapon?')) {
      try {
        await weaponsAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = weapons.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
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
      attacks: 0,
      points: 0,
      rules: []
    });
    setSelectedRules([]);
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
            setError(null);
            setValidationErrors({});
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
                  maxLength={100}
                  title="Maximum 100 characters"
                />
                {validationErrors.name && (
                  <div className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {validationErrors.name}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="ranged">Ranged</option>
                  <option value="melee">Melee</option>
                </select>
                {validationErrors.type && (
                  <div className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {validationErrors.type}
                  </div>
                )}
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
                  <select
                    name="ap"
                    value={formData.ap}
                    onChange={handleInputChange}
                  >
                    <option value="">Select AP</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
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
        
        {/* Pagination */}
        {weapons && weapons.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={totalItems}
            pageSizeOptions={pageSizeOptions}
          />
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
              closeRuleSelector();
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
                onClick={closeRuleSelector}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Search and Filter Rules
              </label>
              <input
                type="text"
                placeholder="Type to filter rules..."
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
            
            {/* Dropdown-style rule selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Select Rule from List
              </label>
              {ruleLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  Loading rules...
                </div>
              ) : availableRules.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  {ruleSearchTerm ? `No weapon rules found matching "${ruleSearchTerm}".` : 'No weapon rules available.'}
                </div>
              ) : (
                <select
                  id="rule-dropdown-selector"
                  size="8"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    color: '#f0f6fc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    const selectedRule = availableRules.find(r => r.id === e.target.value);
                    if (selectedRule) {
                      document.getElementById('selected-rule-id').value = selectedRule.id;
                      document.getElementById('selected-rule-name').textContent = selectedRule.name;
                      document.getElementById('selected-rule-description').textContent = selectedRule.description;
                    }
                  }}
                >
                  {availableRules.map(rule => (
                    <option 
                      key={rule.id} 
                      value={rule.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#21262d',
                        color: '#f0f6fc',
                        cursor: 'pointer'
                      }}
                    >
                      {rule.name} - {rule.type}{rule.points && rule.points.length > 0 ? ` (${rule.points[0]}/${rule.points[1]}/${rule.points[2]} pts)` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Selected rule details and add button */}
            {availableRules.length > 0 && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <input type="hidden" id="selected-rule-id" />
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Selected Rule:
                  </div>
                  <div id="selected-rule-name" style={{ color: '#f0f6fc', fontWeight: 'bold', fontSize: '1rem' }}>
                    {availableRules[0]?.name || 'None'}
                  </div>
                  <div id="selected-rule-description" style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {availableRules[0]?.description || ''}
                  </div>
                </div>
                
                {/* Tier selection and add button */}
                <div>
                  {availableRules[0] && availableRules[0].points && availableRules[0].points.length > 0 ? (
                    <>
                      <label style={{ display: 'block', color: '#8b949e', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        Select Tier:
                      </label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {[1, 2, 3].map(tier => (
                          <button
                            key={tier}
                            onClick={() => {
                              const ruleId = document.getElementById('selected-rule-id')?.value || availableRules[0]?.id;
                              const selectedRule = availableRules.find(r => r.id === ruleId) || availableRules[0];
                              if (selectedRule) {
                                handleRuleSelect(selectedRule, tier);
                              }
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: '#238636',
                              color: 'white',
                              border: 'none',
                              padding: '0.65rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                          >
                            Tier {tier} ({availableRules[0].points[tier-1]} pts)
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        const ruleId = document.getElementById('selected-rule-id')?.value || availableRules[0]?.id;
                        const selectedRule = availableRules.find(r => r.id === ruleId) || availableRules[0];
                        if (selectedRule) {
                          handleRuleSelect(selectedRule, 1);
                        }
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#238636',
                        color: 'white',
                        border: 'none',
                        padding: '0.65rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                    >
                      Add Rule
                    </button>
                  )}
                </div>
              </div>
            )}
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
