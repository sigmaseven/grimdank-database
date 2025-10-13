import React, { useState, useEffect } from 'react';
import { armyListsAPI } from '../services/api';

function ArmyLists() {
  const [armyLists, setArmyLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArmyList, setEditingArmyList] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    player: '',
    faction: '',
    points: 0,
    units: [],
    description: ''
  });

  useEffect(() => {
    loadArmyLists();
  }, []);

  const loadArmyLists = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { name: searchTerm } : {};
      const data = await armyListsAPI.getAll(params);
      setArmyLists(data);
      setError(null);
    } catch (err) {
      setError('Failed to load army lists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      loadArmyLists();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArmyLists();
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
      loadArmyLists();
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
        loadArmyLists();
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
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search army lists by name..."
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
        {armyLists.length === 0 ? (
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
              {armyLists.map(armyList => (
                <tr key={armyList.id}>
                  <td>{armyList.name}</td>
                  <td>{armyList.player}</td>
                  <td>{armyList.faction}</td>
                  <td>{armyList.points}</td>
                  <td>{armyList.description}</td>
                  <td>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(armyList)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(armyList.id)}
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

export default ArmyLists;
