import React, { useState, useEffect, useCallback, useRef } from 'react';
import { armyBooksAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

function ArmyBooks() {
  const [armyBooks, setArmyBooks] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArmyBook, setEditingArmyBook] = useState(null);
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
    factionId: '',
    description: '',
    units: [],
    rules: []
  });

  const loadArmyBooks = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await armyBooksAPI.getAll(params);
      setArmyBooks(Array.isArray(data) ? data : []);
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
      // Handle API error gracefully
      setArmyBooks([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems, setLoading]);

  useEffect(() => {
    loadArmyBooks(searchTerm);
  }, [searchTerm, pageSize, skip, loadArmyBooks]);

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
      loadArmyBooks('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadArmyBooks(value, false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare army book data with rules (validate before mapping)
      const armyBookData = {
        ...formData,
        rules: (formData.rules || [])
          .filter(rule => rule && rule.id) // Validate rule exists
          .map(rule => ({
            ruleId: rule.id,
            tier: Math.min(3, Math.max(1, rule.tier || 1)) // Clamp tier to 1-3
          }))
      };
      
      if (editingArmyBook) {
        await armyBooksAPI.update(editingArmyBook.id, armyBookData);
      } else {
        await armyBooksAPI.create(armyBookData);
      }
      
      setShowForm(false);
      setEditingArmyBook(null);
      resetForm();
      await loadArmyBooks(searchTerm, false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save army book');
      console.error('Failed to save army book:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (armyBook) => {
    setEditingArmyBook(armyBook);
    setFormData({
      name: armyBook.name,
      factionId: armyBook.factionId,
      description: armyBook.description,
      units: armyBook.units || [],
      rules: armyBook.rules || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const armyBook = armyBooks.find(ab => ab.id === id);
    const hasUnits = armyBook?.units?.length > 0;
    const hasRules = armyBook?.rules?.length > 0;
    
    let confirmMessage = 'Are you sure you want to delete this army book?';
    if (hasUnits || hasRules) {
      confirmMessage += '\n\n⚠️ This army book has:\n';
      if (hasUnits) confirmMessage += `- ${armyBook.units.length} unit(s)\n`;
      if (hasRules) confirmMessage += `- ${armyBook.rules.length} rule(s)\n`;
      confirmMessage += '\nThese references will be removed.';
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await armyBooksAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = armyBooks.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        await loadArmyBooks(searchTerm, false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete army book');
        console.error('Failed to delete army book:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      factionId: '',
      description: '',
      units: [],
      rules: []
    });
  };

  if (loading) return <div className="loading">Loading army books...</div>;

  return (
    <div>
      <div className="card">
        <h2>Army Books Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search army books by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingArmyBook(null);
            setError(null);
            resetForm();
          }}
        >
          Add New Army Book
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingArmyBook ? 'Edit Army Book' : 'Add New Army Book'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingArmyBook(null);
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
                <label>Faction</label>
                <input
                  type="text"
                  name="factionId"
                  value={formData.factionId}
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
                  maxLength={500}
                  title="Maximum 500 characters"
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={submitting}
                  style={{
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : (editingArmyBook ? 'Update Army Book' : 'Create Army Book')}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingArmyBook(null);
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
        <h3>Army Books List</h3>
        {!armyBooks || armyBooks.length === 0 ? (
          <p>No army books found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Faction</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {armyBooks && armyBooks.map(armyBook => (
                <tr key={armyBook.id}>
                  <td><strong>{armyBook.name}</strong></td>
                  <td>{armyBook.factionId}</td>
                  <td>{armyBook.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(armyBook)}
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
                        onClick={() => handleDelete(armyBook.id)}
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
        {armyBooks && armyBooks.length > 0 && (
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

export default ArmyBooks;
