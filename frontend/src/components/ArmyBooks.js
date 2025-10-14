import React, { useState, useEffect, useCallback, useRef } from 'react';
import { armyBooksAPI } from '../services/api';
import { Icon } from './Icons';

function ArmyBooks() {
  const [armyBooks, setArmyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArmyBook, setEditingArmyBook] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    faction: '',
    description: '',
    units: [],
    rules: []
  });

  const loadArmyBooks = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await armyBooksAPI.getAll(params);
      setArmyBooks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load army books');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadArmyBooks('');
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
    try {
      if (editingArmyBook) {
        await armyBooksAPI.update(editingArmyBook.id, formData);
      } else {
        await armyBooksAPI.create(formData);
      }
      setShowForm(false);
      setEditingArmyBook(null);
      resetForm();
      loadArmyBooks(searchTerm, false);
    } catch (err) {
      setError('Failed to save army book');
      console.error(err);
    }
  };

  const handleEdit = (armyBook) => {
    setEditingArmyBook(armyBook);
    setFormData({
      name: armyBook.name,
      faction: armyBook.faction,
      description: armyBook.description,
      units: armyBook.units || [],
      rules: armyBook.rules || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this army book?')) {
      try {
        await armyBooksAPI.delete(id);
        loadArmyBooks(searchTerm, false);
      } catch (err) {
        setError('Failed to delete army book');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      faction: '',
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
                />
              </div>
              
              <div className="form-group">
                <label>Faction</label>
                <input
                  type="text"
                  name="faction"
                  value={formData.faction}
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
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  {editingArmyBook ? 'Update Army Book' : 'Create Army Book'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingArmyBook(null);
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
                  <td>{armyBook.name}</td>
                  <td>{armyBook.faction}</td>
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
      </div>
    </div>
  );
}

export default ArmyBooks;
