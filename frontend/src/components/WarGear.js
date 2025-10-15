import React, { useState, useEffect, useCallback, useRef } from 'react';
import { wargearAPI, rulesAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

function WarGear() {
  const [wargear, setWargear] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWargear, setEditingWargear] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    points: 0,
    description: '',
    rules: []
  });

  // Rule attachment system
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);
  const baseWarGearPointsRef = useRef(0);

  const loadWargear = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await wargearAPI.getAll(params);
      setWargear(Array.isArray(data) ? data : []);
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
      console.log('WarGear API error:', err);
      setWargear([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems]);

  useEffect(() => {
    loadWargear(searchTerm);
  }, [searchTerm, pageSize, skip, loadWargear]);

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
      loadWargear('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadWargear(value, false);
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

  // Rule loading and selection functions
  const loadRules = useCallback(async (query = '') => {
    try {
      setRuleLoading(true);
      // Filter rules for WarGear: only show rules with type "WarGear"
      const rules = await rulesAPI.getAll({ name: query, limit: 100 });
      const filteredRules = Array.isArray(rules) ? rules.filter(rule => 
        rule.type === 'WarGear'
      ) : [];
      setAvailableRules(filteredRules);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setAvailableRules([]);
    } finally {
      setRuleLoading(false);
    }
  }, []);


  // Load initial rules when dialog opens
  useEffect(() => {
    if (showRuleSelector) {
      loadRules(''); // Load all rules initially
    }
  }, [showRuleSelector, loadRules]);

  const handleRuleSelect = async (rule, tier = 1) => {
    try {
      // Check if rule is already selected
      const isAlreadySelected = selectedRules.some(r => r.id === rule.id);
      if (isAlreadySelected) {
        return;
      }

      setSelectedRules(prev => [...prev, { ...rule, tier }]);
      closeRuleSelector();
    } catch (err) {
      console.error('Failed to select rule:', err);
    }
  };

  const handleRuleRemove = async (ruleId) => {
    try {
      setSelectedRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      console.error('Failed to remove rule:', err);
    }
  };

  const handleRuleSearch = (e) => {
    const query = e.target.value;
    setRuleSearchTerm(query);
    
    if (query.length === 0) {
      loadRules('');
    } else if (query.length > 2) {
      loadRules(query);
    } else {
      setAvailableRules([]);
    }
  };

  const closeRuleSelector = () => {
    setShowRuleSelector(false);
    setRuleSearchTerm('');
    setAvailableRules([]);
  };

  // Update base wargear points when form data changes and no rules are selected
  useEffect(() => {
    if (selectedRules.length === 0) {
      baseWarGearPointsRef.current = formData.points || 0;
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
    const totalPoints = baseWarGearPointsRef.current + rulePoints;
    
    setFormData(prev => ({
      ...prev,
      points: totalPoints
    }));
  }, [selectedRules]);

  const resetForm = () => {
    setFormData({
      name: '',
      points: 0,
      description: '',
      rules: []
    });
    setSelectedRules([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare wargear data with rules
      const wargearData = {
        ...formData,
        rules: selectedRules
          .filter(rule => rule && rule.id) // Validate rule exists and has ID
          .map(rule => ({
            ruleId: rule.id,
            tier: Math.min(3, Math.max(1, rule.tier || 1)) // Clamp tier to 1-3
          }))
      };
      
      if (editingWargear) {
        await wargearAPI.update(editingWargear.id, wargearData);
      } else {
        await wargearAPI.create(wargearData);
      }
      
      setShowForm(false);
      setEditingWargear(null);
      resetForm();
      await loadWargear(searchTerm, false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save wargear');
      console.error('Failed to save wargear:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (wargearItem) => {
    setEditingWargear(wargearItem);
    setFormData({
      name: wargearItem.name || '',
      points: wargearItem.points || 0,
      description: wargearItem.description || '',
      rules: wargearItem.rules || []
    });
    setSelectedRules(wargearItem.rules || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wargear?')) {
      try {
        await wargearAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = wargear.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        loadWargear(searchTerm, false);
      } catch (err) {
        setError('Failed to delete wargear');
        console.error('Failed to delete wargear:', err);
      }
    }
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
            setEditingWargear(null);
            setError(null);
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
              <h3>{editingWargear ? 'Edit WarGear' : 'Add New WarGear'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingWargear(null);
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
              </div>
              
              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="0"
                  style={{
                    backgroundColor: selectedRules.length > 0 ? '#21262d' : undefined,
                    color: selectedRules.length > 0 ? '#8b949e' : undefined,
                    cursor: selectedRules.length > 0 ? 'not-allowed' : undefined
                  }}
                  readOnly={selectedRules.length > 0}
                  title={selectedRules.length > 0 ? 'Points automatically calculated from base wargear + attached rules' : 'Enter base wargear points'}
                />
                {selectedRules.length > 0 && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#8b949e', 
                    marginTop: '0.25rem' 
                  }}>
                    Auto-calculated: Base wargear + rule points
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength={500}
                  title="Maximum 500 characters"
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
                            fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ color: '#f0f6fc' }}>{rule.name}</span>
                          {rule.tier && (
                            <span style={{ 
                              color: '#58a6ff', 
                              fontSize: '0.7rem',
                              backgroundColor: '#0d1117',
                              padding: '0.1rem 0.3rem',
                              borderRadius: '8px'
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
                              lineHeight: 1
                            }}
                            title="Remove rule"
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
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : ((editingWargear ? 'Update' : 'Create') + ' WarGear')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWargear(null);
                    setError(null);
                    resetForm();
                  }}
                  disabled={submitting}
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
                <th>Points</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wargear.map((wargearItem) => (
                <tr key={wargearItem.id}>
                  <td>{wargearItem.name}</td>
                  <td>{wargearItem.points}</td>
                  <td>{wargearItem.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div
                        onClick={() => handleEdit(wargearItem)}
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
                        onClick={() => handleDelete(wargearItem.id)}
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
        {wargear && wargear.length > 0 && (
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

      {/* Rule Selector Dialog */}
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
                  {ruleSearchTerm ? `No wargear rules found matching "${ruleSearchTerm}".` : 'No wargear rules available.'}
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
    </div>
  );
}

export default WarGear;