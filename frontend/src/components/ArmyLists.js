import React, { useState, useEffect, useCallback, useRef } from 'react';
import { armyListsAPI } from '../services/api';
import { Icon } from './Icons';

function ArmyLists() {
  const [armyLists, setArmyLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArmyList, setEditingArmyList] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    player: '',
    faction: '',
    points: 0,
    units: [],
    description: ''
  });

  const loadArmyLists = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await armyListsAPI.getAll(params);
      setArmyLists(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load army lists');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadArmyLists('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArmyList) {
        await armyListsAPI.update(editingArmyList.id, formData);
      } else {
        await armyListsAPI.create(formData);
      }
      setShowForm(false);
      setEditingArmyList(null);
      resetForm();
      loadArmyLists(searchTerm, false);
    } catch (err) {
      setError('Failed to save army list');
      console.error(err);
    }
  };

  const handleEdit = (armyList) => {
    setEditingArmyList(armyList);
    setFormData({
      name: armyList.name,
      player: armyList.player,
      faction: armyList.faction,
      points: armyList.points,
      units: armyList.units || [],
      description: armyList.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this army list?')) {
      try {
        await armyListsAPI.delete(id);
        loadArmyLists(searchTerm, false);
      } catch (err) {
        setError('Failed to delete army list');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      player: '',
      faction: '',
      points: 0,
      units: [],
      description: ''
    });
  };

  if (loading) return <div className="loading">Loading army lists...</div>;

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
                />
              </div>
              
              <div className="form-group">
                <label>Player</label>
                <input
                  type="text"
                  name="player"
                  value={formData.player}
                  onChange={handleInputChange}
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
                <label>Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
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
                  {editingArmyList ? 'Update Army List' : 'Create Army List'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingArmyList(null);
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
              {armyLists && armyLists.map(armyList => (
                <tr key={armyList.id}>
                  <td><strong>{armyList.name}</strong></td>
                  <td>{armyList.player}</td>
                  <td>{armyList.faction}</td>
                  <td>{armyList.points}</td>
                  <td>{armyList.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(armyList)}
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
                        onClick={() => handleDelete(armyList.id)}
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

export default ArmyLists;
