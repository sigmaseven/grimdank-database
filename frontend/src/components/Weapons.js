import React, { useState, useEffect, useCallback, useRef } from 'react';
import { weaponsAPI } from '../services/api';
import { Icon } from './Icons';

function Weapons() {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    range: '',
    strength: '',
    ap: '',
    attacks: '',
    abilities: '',
    points: 0
  });

  const loadWeapons = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await weaponsAPI.getAll(params);
      setWeapons(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load weapons');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadWeapons('');
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
      loadWeapons('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadWeapons(value, false);
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
      if (editingWeapon) {
        await weaponsAPI.update(editingWeapon.id, formData);
      } else {
        await weaponsAPI.create(formData);
      }
      setShowForm(false);
      setEditingWeapon(null);
      resetForm();
      loadWeapons(searchTerm, false);
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
      attacks: weapon.attacks,
      abilities: weapon.abilities,
      points: weapon.points
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this weapon?')) {
      try {
        await weaponsAPI.delete(id);
        loadWeapons(searchTerm, false);
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
      attacks: '',
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
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search weapons by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
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
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="Ranged">Ranged</option>
                  <option value="Melee">Melee</option>
                </select>
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
                  <label>Attacks</label>
                  <input
                    type="text"
                    name="attacks"
                    value={formData.attacks}
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
        {!weapons || weapons.length === 0 ? (
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
                <th>Attacks</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {weapons && weapons.map(weapon => (
                <tr key={weapon.id}>
                  <td>{weapon.name}</td>
                  <td>{weapon.type}</td>
                  <td>{weapon.range}</td>
                  <td>{weapon.strength}</td>
                  <td>{weapon.ap}</td>
                  <td>{weapon.attacks}</td>
                  <td>{weapon.points}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(weapon)}
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
                        onClick={() => handleDelete(weapon.id)}
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

export default Weapons;
