import React, { useState, useEffect, useCallback, useRef } from 'react';
import { armyListsAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { useNavigationLoading } from '../hooks/useNavigationLoading';

function ArmyLists() {
  const [armyLists, setArmyLists] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isNavigating } = useNavigationLoading();
  const [showForm, setShowForm] = useState(false);
  const [editingArmyList, setEditingArmyList] = useState(null);
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
    player: '',
    factionId: '',
    points: 0,
    unitIds: [],
    description: ''
  });

  const loadArmyLists = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await armyListsAPI.getAll(params);
      setArmyLists(Array.isArray(data) ? data : []);
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
      setArmyLists([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems, setLoading]);

  useEffect(() => {
    loadArmyLists(searchTerm);
  }, [searchTerm, pageSize, skip, loadArmyLists]);

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
      loadArmyLists('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadArmyLists(value, false);
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
      player: '',
      factionId: '',
      points: 0,
      unitIds: [],
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare army list data with units
      const armyListData = {
        ...formData,
        unitIds: formData.unitIds || []
      };
      
      if (editingArmyList) {
        await armyListsAPI.update(editingArmyList.id, armyListData);
      } else {
        await armyListsAPI.create(armyListData);
      }
      
      setShowForm(false);
      setEditingArmyList(null);
      resetForm();
      await loadArmyLists(searchTerm, false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save army list');
      console.error('Failed to save army list:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (armyList) => {
    setEditingArmyList(armyList);
    setFormData({
      name: armyList.name || '',
      player: armyList.player || '',
      factionId: armyList.factionId || '',
      points: armyList.points || 0,
      unitIds: armyList.unitIds || [],
      description: armyList.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const armyList = armyLists.find(al => al.id === id);
    const hasUnits = armyList?.unitIds?.length > 0;
    
    let confirmMessage = 'Are you sure you want to delete this army list?';
    if (hasUnits) {
      confirmMessage += `\n\n⚠️ This army list has ${armyList.unitIds.length} unit(s).\nThese references will be removed.`;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await armyListsAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = armyLists.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        await loadArmyLists(searchTerm, false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete army list');
        console.error('Failed to delete army list:', err);
      }
    }
  };

  // Don't show loading message during navigation - show content immediately
  if (loading && !isNavigating) return <div className="loading">Loading army lists...</div>;

  return (
    <div>
      <div className="card">
        <h2>Army Lists Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search army lists by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingArmyList(null);
            setError(null);
            resetForm();
          }}
        >
          Add New Army List
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingArmyList ? 'Edit Army List' : 'Add New Army List'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingArmyList(null);
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
                <label>Player *</label>
                <input
                  type="text"
                  name="player"
                  value={formData.player}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  title="Maximum 100 characters"
                />
              </div>
              
              <div className="form-group">
                <label>Faction *</label>
                <input
                  type="text"
                  name="factionId"
                  value={formData.factionId}
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
                  maxLength={500}
                  title="Maximum 500 characters"
                />
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
                  {submitting ? 'Saving...' : ((editingArmyList ? 'Update' : 'Create') + ' Army List')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArmyList(null);
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
        <h3>Army Lists List</h3>
        {!armyLists || armyLists.length === 0 ? (
          <p>No army lists found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Player</th>
                <th>Faction</th>
                <th>Points</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {armyLists.map((armyList) => (
                <tr key={armyList.id}>
                  <td>{armyList.name}</td>
                  <td>{armyList.player}</td>
                  <td>{armyList.factionId}</td>
                  <td>{armyList.points}</td>
                  <td>{armyList.description}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(armyList)}
                        className="btn btn-sm btn-primary"
                        title="Edit"
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        onClick={() => handleDelete(armyList.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
                        <Icon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {armyLists && armyLists.length > 0 && (
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

export default ArmyLists;