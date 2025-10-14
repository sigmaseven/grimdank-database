import React, { useState, useEffect, useCallback, useRef } from 'react';
import { wargearAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

function WarGear() {
  const [wargear, setWargear] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWargear, setEditingWargear] = useState(null);
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
    points: 0,
    description: '',
    rules: []
  });

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
  }, [loadWargear, searchTerm]);

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

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      points: 0,
      description: '',
      rules: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingWargear) {
        await wargearAPI.update(editingWargear.id, formData);
      } else {
        await wargearAPI.create(formData);
      }
      
      setError(null); // Clear any previous errors
      loadWargear(searchTerm, false);
      setShowForm(false);
      setEditingWargear(null);
      resetForm();
    } catch (err) {
      setError('Failed to save wargear');
      console.error('Failed to save wargear:', err);
    }
  };

  const handleEdit = (wargearItem) => {
    setEditingWargear(wargearItem);
    setFormData({
      name: wargearItem.name || '',
      type: wargearItem.type || '',
      points: wargearItem.points || 0,
      description: wargearItem.description || '',
      rules: wargearItem.rules || []
    });
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingWargear ? 'Update' : 'Create'} WarGear
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWargear(null);
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
              {wargear.map((wargearItem) => (
                <tr key={wargearItem.id}>
                  <td>{wargearItem.name}</td>
                  <td>{wargearItem.type}</td>
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
    </div>
  );
}

export default WarGear;