import React, { useState, useEffect, useCallback, useRef } from 'react';
import { factionsAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

function Factions() {
  const [factions, setFactions] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFaction, setEditingFaction] = useState(null);
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
    description: '',
    type: ''
  });

  const loadFactions = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await factionsAPI.getAll(params);
      setFactions(Array.isArray(data) ? data : []);
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
      console.log('Factions API error:', err);
      setFactions([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems, setLoading]);

  useEffect(() => {
    loadFactions(searchTerm);
  }, [searchTerm, pageSize, skip, loadFactions]);

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
      loadFactions('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadFactions(value, false);
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: ''
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
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
      if (editingFaction) {
        await factionsAPI.update(editingFaction.id, formData);
      } else {
        await factionsAPI.create(formData);
      }
      
      setError(null); // Clear any previous errors
      setValidationErrors({}); // Clear validation errors
      loadFactions(searchTerm, false);
      setShowForm(false);
      setEditingFaction(null);
      resetForm();
    } catch (err) {
      console.error('Failed to save faction:', err);
      setError('Failed to save faction');
    }
  };

  const handleEdit = (faction) => {
    setEditingFaction(faction);
    setFormData({
      name: faction.name || '',
      description: faction.description || '',
      type: faction.type || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faction?')) {
      try {
        await factionsAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = factions.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        loadFactions(searchTerm, false);
      } catch (err) {
        console.error('Failed to delete faction:', err);
        setError('Failed to delete faction. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading factions...</div>;

  return (
    <div>
      <div className="card">
        <h2>Factions Management</h2>
        
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
          className="btn" 
          onClick={() => {
            setShowForm(true);
            setEditingFaction(null);
            setError(null);
            setValidationErrors({});
            resetForm();
          }}
        >
          Add New Faction
        </button>
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
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="Official">Official</option>
                  <option value="Custom">Custom</option>
                  <option value="Homebrew">Homebrew</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn">
                  {editingFaction ? 'Update' : 'Create'} Faction
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

      <div className="card">
        <h3>Factions List</h3>
        {!factions || factions.length === 0 ? (
          <p>No factions found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factions.map((faction) => (
                <tr key={faction.id}>
                  <td>{faction.name}</td>
                  <td>{faction.description}</td>
                  <td>{faction.type}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(faction)}
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
                        onClick={() => handleDelete(faction.id)}
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
        {factions && factions.length > 0 && (
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
    </div>
  );
}

export default Factions;