import React, { useState, useEffect, useCallback, useRef } from 'react';
import { unitsAPI, rulesAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

function Units() {
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
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
    melee: 0,
    ranged: 0,
    morale: 0,
    defense: 0,
    points: 0,
    rules: [],
    availableWeapons: [],
    availableWarGear: [],
    weapons: [],
    warGear: []
  });

  // Rule attachment system
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [ruleSuggestions, setRuleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const loadUnits = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await unitsAPI.getAll(params);
      setUnits(Array.isArray(data) ? data : []);
      setError(null);
      
      // Update total items count
      if (data.length === 0) {
        // If we got no results, the total is just the current skip value
        updateTotalItems(skip);
      } else if (data.length < pageSize) {
        // If we got fewer results than page size, this is the last page
        updateTotalItems(skip + data.length);
      } else {
        // If we got a full page, there might be more
        updateTotalItems(skip + data.length + 1);
      }
    } catch (err) {
      // Handle empty results gracefully - don't show error for empty lists
      console.log('Units API error:', err);
      setUnits([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems]);

  useEffect(() => {
    loadUnits(searchTerm);
  }, [loadUnits, searchTerm]);

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
      loadUnits('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadUnits(value, false);
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['melee', 'ranged', 'morale', 'defense', 'points'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      melee: 0,
      ranged: 0,
      morale: 0,
      defense: 0,
      points: 0,
      rules: [],
      availableWeapons: [],
      availableWarGear: [],
      weapons: [],
      warGear: []
    });
    setSelectedRules([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const unitData = {
        ...formData,
        rules: selectedRules.map(rule => ({
          ruleId: rule.id,
          tier: rule.tier || 1
        }))
      };
      
      if (editingUnit) {
        await unitsAPI.update(editingUnit.id, unitData);
      } else {
        await unitsAPI.create(unitData);
      }
      
      setError(null); // Clear any previous errors
      loadUnits(searchTerm, false);
      setShowForm(false);
      setEditingUnit(null);
      resetForm();
    } catch (err) {
      setError('Failed to save unit');
      console.error('Failed to save unit:', err);
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name || '',
      type: unit.type || '',
      melee: unit.melee || 0,
      ranged: unit.ranged || 0,
      morale: unit.morale || 0,
      defense: unit.defense || 0,
      points: unit.points || 0,
      rules: unit.rules || [],
      availableWeapons: unit.availableWeapons || [],
      availableWarGear: unit.availableWarGear || [],
      weapons: unit.weapons || [],
      warGear: unit.warGear || []
    });
    // Load selected rules for editing
    setSelectedRules(unit.rules || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await unitsAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = units.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        loadUnits(searchTerm, false);
      } catch (err) {
        setError('Failed to delete unit');
        console.error('Failed to delete unit:', err);
      }
    }
  };

  // Rule loading and selection functions
  const loadRules = useCallback(async (query = '') => {
    try {
      setRuleLoading(true);
      // Filter rules for Units: allow all types (Defensive, Offensive, Passive, Tactical)
      const rules = await rulesAPI.getAll({ name: query, limit: 50 });
      const filteredRules = Array.isArray(rules) ? rules.filter(rule => 
        rule.type === 'Defensive' || 
        rule.type === 'Offensive' || 
        rule.type === 'Passive' || 
        rule.type === 'Tactical'
      ) : [];
      setAvailableRules(filteredRules);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setAvailableRules([]);
    } finally {
      setRuleLoading(false);
    }
  }, []);

  const loadRuleSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setRuleSuggestions([]);
      return;
    }
    
    try {
      const rules = await rulesAPI.getAll({ name: query, limit: 10 });
      // Filter rules for Units: allow all types (Defensive, Offensive, Passive, Tactical)
      const filteredRules = Array.isArray(rules) ? rules.filter(rule => 
        rule.type === 'Defensive' || 
        rule.type === 'Offensive' || 
        rule.type === 'Passive' || 
        rule.type === 'Tactical'
      ) : [];
      setRuleSuggestions(filteredRules);
    } catch (err) {
      console.error('Failed to load rule suggestions:', err);
      setRuleSuggestions([]);
    }
  }, []);

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

  const handleRuleSelect = async (rule, tier = 1) => {
    try {
      // Check if rule is already selected
      const isAlreadySelected = selectedRules.some(r => r.id === rule.id);
      if (isAlreadySelected) {
        return;
      }

      // Add rule with tier
      const ruleWithTier = { ...rule, tier };
      setSelectedRules(prev => [...prev, ruleWithTier]);
      
      // Clear search
      setRuleSearchTerm('');
      setAvailableRules([]);
    } catch (err) {
      console.error('Failed to select rule:', err);
    }
  };

  const handleRuleRemove = async (ruleId) => {
    try {
      // Remove from selected rules
      setSelectedRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      console.error('Failed to remove rule:', err);
    }
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

  if (loading) return <div className="loading">Loading units...</div>;

  return (
    <div>
      <div className="card">
        <h2>Units Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search units by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingUnit(null);
            resetForm();
          }}
        >
          Add New Unit
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingUnit(null);
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
                <label>Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="nested-form">
                <h4>Combat Stats</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Melee</label>
                    <input
                      type="number"
                      name="melee"
                      value={formData.melee}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ranged</label>
                    <input
                      type="number"
                      name="ranged"
                      value={formData.ranged}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Morale</label>
                    <input
                      type="number"
                      name="morale"
                      value={formData.morale}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Defense</label>
                    <input
                      type="number"
                      name="defense"
                      value={formData.defense}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="0"
                />
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
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUnit ? 'Update' : 'Create'} Unit
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUnit(null);
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
        <h3>Units List</h3>
        {!units || units.length === 0 ? (
          <p>No units found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Melee</th>
                <th>Ranged</th>
                <th>Morale</th>
                <th>Defense</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td>{unit.name}</td>
                  <td>{unit.type}</td>
                  <td>{unit.melee || 0}</td>
                  <td>{unit.ranged || 0}</td>
                  <td>{unit.morale || 0}</td>
                  <td>{unit.defense || 0}</td>
                  <td>{unit.points}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(unit)}
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
                        title="Edit"
                      >
                        <Icon name="edit" size={20} color="#8b949e" />
                      </div>
                      <div
                        onClick={() => handleDelete(unit.id)}
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
                        title="Delete"
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
        {units && units.length > 0 && (
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

      {/* Rule Selector - appears on top of unit form */}
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
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                  Loading rules...
                </div>
              ) : availableRules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8b949e' }}>
                  {ruleSearchTerm ? 'No rules found matching your search.' : 'Start typing to search for rules.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableRules.map(rule => (
                    <div
                      key={rule.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Units;