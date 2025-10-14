import React, { useState, useEffect, useCallback, useRef } from 'react';
import { unitsAPI, rulesAPI, weaponsAPI, wargearAPI } from '../services/api';
import { Icon } from './Icons';

function Units() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showWarGearModal, setShowWarGearModal] = useState(false);
  const [availableRules, setAvailableRules] = useState([]);
  const [availableWeapons, setAvailableWeapons] = useState([]);
  const [availableWarGear, setAvailableWarGear] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    movement: '',
    weaponSkill: '',
    ballisticSkill: '',
    strength: '',
    toughness: '',
    wounds: '',
    initiative: '',
    attacks: '',
    leadership: '',
    save: '',
    points: 0,
    rules: [],
    availableWeapons: [],
    availableWarGear: []
  });

  const loadUnits = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = searchQuery ? { name: searchQuery } : {};
      const data = await unitsAPI.getAll(params);
      setUnits(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load units');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const loadAvailableData = useCallback(async () => {
    try {
      const [rulesData, weaponsData, wargearData] = await Promise.all([
        rulesAPI.getAll(),
        weaponsAPI.getAll(),
        wargearAPI.getAll()
      ]);
      setAvailableRules(Array.isArray(rulesData) ? rulesData : []);
      setAvailableWeapons(Array.isArray(weaponsData) ? weaponsData : []);
      setAvailableWarGear(Array.isArray(wargearData) ? wargearData : []);
    } catch (err) {
      console.error('Failed to load available data:', err);
    }
  }, []);

  useEffect(() => {
    loadUnits('');
    loadAvailableData();
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
      loadUnits('', false);
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        loadUnits(value, false);
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
      if (editingUnit) {
        await unitsAPI.update(editingUnit.id, formData);
      } else {
        await unitsAPI.create(formData);
      }
      setShowForm(false);
      setEditingUnit(null);
      resetForm();
      loadUnits(searchTerm, false);
    } catch (err) {
      setError('Failed to save unit');
      console.error(err);
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      type: unit.type,
      movement: unit.movement,
      weaponSkill: unit.weaponSkill,
      ballisticSkill: unit.ballisticSkill,
      strength: unit.strength,
      toughness: unit.toughness,
      wounds: unit.wounds,
      initiative: unit.initiative,
      attacks: unit.attacks,
      leadership: unit.leadership,
      save: unit.save,
      points: unit.points,
      rules: unit.rules || [],
      availableWeapons: unit.availableWeapons || [],
      availableWarGear: unit.availableWarGear || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await unitsAPI.delete(id);
        loadUnits(searchTerm, false);
      } catch (err) {
        setError('Failed to delete unit');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      movement: '',
      weaponSkill: '',
      ballisticSkill: '',
      strength: '',
      toughness: '',
      wounds: '',
      initiative: '',
      attacks: '',
      leadership: '',
      save: '',
      points: 0,
      rules: [],
      availableWeapons: [],
      availableWarGear: []
    });
  };

  const addRule = (rule) => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, rule]
    }));
    setShowRuleModal(false);
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const addWeapon = (weapon) => {
    setFormData(prev => ({
      ...prev,
      availableWeapons: [...prev.availableWeapons, weapon]
    }));
    setShowWeaponModal(false);
  };

  const removeWeapon = (index) => {
    setFormData(prev => ({
      ...prev,
      availableWeapons: prev.availableWeapons.filter((_, i) => i !== index)
    }));
  };

  const addWarGear = (wargear) => {
    setFormData(prev => ({
      ...prev,
      availableWarGear: [...prev.availableWarGear, wargear]
    }));
    setShowWarGearModal(false);
  };

  const removeWarGear = (index) => {
    setFormData(prev => ({
      ...prev,
      availableWarGear: prev.availableWarGear.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="loading">Loading units...</div>;

  return (
    <div>
      <div className="card">
        <h2>Units Management</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search units by name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingUnit(null);
            resetForm();
          }}
        >
          Add New Unit
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingUnit(null);
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
                  <label>Movement</label>
                  <input
                    type="text"
                    name="movement"
                    value={formData.movement}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Weapon Skill</label>
                  <input
                    type="text"
                    name="weaponSkill"
                    value={formData.weaponSkill}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Ballistic Skill</label>
                  <input
                    type="text"
                    name="ballisticSkill"
                    value={formData.ballisticSkill}
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
                  <label>Toughness</label>
                  <input
                    type="text"
                    name="toughness"
                    value={formData.toughness}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Wounds</label>
                  <input
                    type="text"
                    name="wounds"
                    value={formData.wounds}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Initiative</label>
                  <input
                    type="text"
                    name="initiative"
                    value={formData.initiative}
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
                
                <div className="form-group">
                  <label>Leadership</label>
                  <input
                    type="text"
                    name="leadership"
                    value={formData.leadership}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Save</label>
                  <input
                    type="text"
                    name="save"
                    value={formData.save}
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
              </div>

              {/* Rules Section */}
              <div className="nested-form">
                <h4>Rules</h4>
                <div className="array-controls">
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => setShowRuleModal(true)}
                  >
                    Add Rule
                  </button>
                </div>
                {formData.rules.map((rule, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h5>{rule.name}</h5>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => removeRule(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <p>{rule.description}</p>
                  </div>
                ))}
              </div>

              {/* Available Weapons Section */}
              <div className="nested-form">
                <h4>Available Weapons</h4>
                <div className="array-controls">
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => setShowWeaponModal(true)}
                  >
                    Add Weapon
                  </button>
                </div>
                {formData.availableWeapons.map((weapon, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h5>{weapon.name}</h5>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => removeWeapon(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <p>Range: {weapon.range} | S: {weapon.strength} | AP: {weapon.ap} | D: {weapon.damage}</p>
                  </div>
                ))}
              </div>

              {/* Available WarGear Section */}
              <div className="nested-form">
                <h4>Available WarGear</h4>
                <div className="array-controls">
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => setShowWarGearModal(true)}
                  >
                    Add WarGear
                  </button>
                </div>
                {formData.availableWarGear.map((wargear, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h5>{wargear.name}</h5>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => removeWarGear(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <p>{wargear.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  {editingUnit ? 'Update Unit' : 'Create Unit'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingUnit(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rule Selection Modal */}
      {showRuleModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Rule</h3>
              <button className="close-btn" onClick={() => setShowRuleModal(false)}>×</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableRules && availableRules.map(rule => (
                <div key={rule.id} className="card" style={{ marginBottom: '0.5rem' }}>
                  <h5>{rule.name}</h5>
                  <p>{rule.description}</p>
                  <button 
                    className="btn btn-success" 
                    onClick={() => addRule(rule)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weapon Selection Modal */}
      {showWeaponModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Weapon</h3>
              <button className="close-btn" onClick={() => setShowWeaponModal(false)}>×</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableWeapons && availableWeapons.map(weapon => (
                <div key={weapon.id} className="card" style={{ marginBottom: '0.5rem' }}>
                  <h5>{weapon.name}</h5>
                  <p>Range: {weapon.range} | S: {weapon.strength} | AP: {weapon.ap} | D: {weapon.damage}</p>
                  <button 
                    className="btn btn-success" 
                    onClick={() => addWeapon(weapon)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WarGear Selection Modal */}
      {showWarGearModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select WarGear</h3>
              <button className="close-btn" onClick={() => setShowWarGearModal(false)}>×</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableWarGear && availableWarGear.map(wargear => (
                <div key={wargear.id} className="card" style={{ marginBottom: '0.5rem' }}>
                  <h5>{wargear.name}</h5>
                  <p>{wargear.description}</p>
                  <button 
                    className="btn btn-success" 
                    onClick={() => addWarGear(wargear)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Units List</h3>
        {!units || units.length === 0 ? (
          <p>No units found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units && units.map(unit => (
                <tr key={unit.id}>
                  <td>{unit.name}</td>
                  <td>{unit.type}</td>
                  <td>{unit.points}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div 
                        onClick={() => handleEdit(unit)}
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
                        onClick={() => handleDelete(unit.id)}
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

export default Units;
