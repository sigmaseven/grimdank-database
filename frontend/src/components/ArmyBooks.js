import React, { useState, useEffect, useCallback } from 'react';
import { armyBooksAPI } from '../services/api';

function ArmyBooks() {
  const [armyBooks, setArmyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArmyBook, setEditingArmyBook] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    faction: '',
    description: '',
    units: [],
    rules: []
  });

  const loadArmyBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { name: searchTerm } : {};
      const data = await armyBooksAPI.getAll(params);
      setArmyBooks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load army books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadArmyBooks();
  }, [loadArmyBooks]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      loadArmyBooks();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArmyBooks();
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
      loadArmyBooks();
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
        loadArmyBooks();
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
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search army books by name..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button type="submit" className="btn">Search</button>
          </form>
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
        {armyBooks.length === 0 ? (
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
              {armyBooks.map(armyBook => (
                <tr key={armyBook.id}>
                  <td>{armyBook.name}</td>
                  <td>{armyBook.faction}</td>
                  <td>{armyBook.description}</td>
                  <td>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(armyBook)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(armyBook.id)}
                    >
                      Delete
                    </button>
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
