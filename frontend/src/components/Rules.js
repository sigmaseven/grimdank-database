import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { rulesAPI } from '../services/api';
import PointsCalculator from './PointsCalculator';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { useNavigationLoading } from '../hooks/useNavigationLoading';

function Rules() {
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isNavigating } = useNavigationLoading();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showPointsCalculator, setShowPointsCalculator] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
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
    description: '',
    points: [0, 0, 0]
  });

  const [validationErrors, setValidationErrors] = useState({});

  const loadRules = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await rulesAPI.getAll(params);
      setRules(Array.isArray(data) ? data : []);
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
      setRules([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems, setLoading]);

  useEffect(() => {
    loadRules(searchTerm);
  }, [searchTerm, pageSize, skip, loadRules]);

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
      loadRules('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadRules(value, false);
      }, 300);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedRules = useMemo(() => {
    if (!rules || rules.length === 0) return [];
    
    return [...rules].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle numeric fields
      if (sortField === 'points') {
        // For points array, use the first tier for sorting
        aValue = Array.isArray(aValue) ? (aValue[0] || 0) : 0;
        bValue = Array.isArray(bValue) ? (bValue[0] || 0) : 0;
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
  }, [rules, sortField, sortDirection]);


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
      setError(null); // Clear any previous errors
      setShowForm(false);
      setEditingRule(null);
      resetForm();
      setValidationErrors({});
      loadRules(searchTerm, false);
    } catch (err) {
      setError('Failed to save rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      points: rule.points || [0, 0, 0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await rulesAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = rules.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        loadRules(searchTerm, false);
      } catch (err) {
        setError('Failed to delete rule');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      points: [0, 0, 0]
    });
    setValidationErrors({});
  };

  // Don't show loading message during navigation - show content immediately
  if (loading && !isNavigating) return <div className="loading">Loading rules...</div>;

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
            setError(null);
            setValidationErrors({});
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
                <label>Points (3-tiered) *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
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
                  <button 
                    type="button" 
                    onClick={() => setShowPointsCalculator(true)}
                    style={{
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      height: 'fit-content'
                    }}
                    title="Calculate points automatically"
                  >
                    🧮 Calculate
                  </button>
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
                  className="btn btn-secondary" 
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
                <th 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('points')}
                  style={{ cursor: 'pointer', userSelect: 'none', minWidth: '120px', width: '120px' }}
                >
                  Points {sortField === 'points' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedRules.map(rule => (
                <tr key={rule.id}>
                  <td><strong>{rule.name}</strong></td>
                  <td style={{ minWidth: '120px', width: '120px' }}>{rule.points ? rule.points.join(' / ') : '0 / 0 / 0'}</td>
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
        
        {/* Pagination */}
        {rules && rules.length > 0 && (
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

      {showPointsCalculator && (
        <PointsCalculator
          rule={formData.name ? {
            name: formData.name,
            description: formData.description
          } : null}
          onPointsCalculated={(points) => {
            setFormData(prev => ({
              ...prev,
              points: points
            }));
            setShowPointsCalculator(false);
          }}
          onClose={() => setShowPointsCalculator(false)}
        />
      )}
    </div>
  );
}

export default Rules;
