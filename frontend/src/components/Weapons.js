import React, { useState, useEffect } from 'react';
import { weaponsAPI } from '../services/api';

function Weapons() {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    range: '',
    strength: '',
    ap: '',
    damage: '',
    abilities: '',
    points: 0
  });

  useEffect(() => {
    loadWeapons();
  }, []);

  const loadWeapons = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { name: searchTerm } : {};
      const data = await weaponsAPI.getAll(params);
      setWeapons(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weapons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      loadWeapons();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadWeapons();
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
      if (editingWeapon) {
        await weaponsAPI.update(editingWeapon.id, formData);
      } else {
        await weaponsAPI.create(formData);
      }
      setShowForm(false);
      setEditingWeapon(null);
      resetForm();
      loadWeapons();
    } catch (err) {
      setError('Failed to save weapon');
      console.error(err);
    }
  };

  const handleEdit = (weapon) => {
    setEditingWeapon(weapon);
    setFormData({
      name: weapon.name,
      type: weapon.type,
      range: weapon.range,
      strength: weapon.strength,
      ap: weapon.ap,
      damage: weapon.damage,
      abilities: weapon.abilities,
      points: weapon.points
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this weapon?')) {
      try {
        await weaponsAPI.delete(id);
        loadWeapons();
      } catch (err) {
        setError('Failed to delete weapon');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      range: '',
      strength: '',
      ap: '',
      damage: '',
      abilities: '',
      points: 0
    });
  };

  if (loading) return <div className="loading">Loading weapons...</div>;

  return (
    <div>
      <div className="card">
        <h2>Weapons Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search weapons by name..."
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
            setEditingWeapon(null);
            resetForm();
          }}
        >
          Add New Weapon
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingWeapon ? 'Edit Weapon' : 'Add New Weapon'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingWeapon(null);
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
                <label>Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Range</label>
                  <input
                    type="text"
                    name="range"
                    value={formData.range}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Strength</label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>AP</label>
                  <input
                    type="text"
                    name="ap"
                    value={formData.ap}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Damage</label>
                  <input
                    type="text"
                    name="damage"
                    value={formData.damage}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Abilities</label>
                <textarea
                  name="abilities"
                  value={formData.abilities}
                  onChange={handleInputChange}
                  rows="3"
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

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  {editingWeapon ? 'Update Weapon' : 'Create Weapon'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingWeapon(null);
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
        <h3>Weapons List</h3>
        {weapons.length === 0 ? (
          <p>No weapons found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Range</th>
                <th>Strength</th>
                <th>AP</th>
                <th>Damage</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {weapons.map(weapon => (
                <tr key={weapon.id}>
                  <td>{weapon.name}</td>
                  <td>{weapon.type}</td>
                  <td>{weapon.range}</td>
                  <td>{weapon.strength}</td>
                  <td>{weapon.ap}</td>
                  <td>{weapon.damage}</td>
                  <td>{weapon.points}</td>
                  <td>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(weapon)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(weapon.id)}
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

export default Weapons;
