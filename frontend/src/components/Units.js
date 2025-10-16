import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { unitsAPI, rulesAPI, weaponsAPI, wargearAPI } from '../services/api';
import { Icon } from './Icons';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { useNavigationLoading } from '../hooks/useNavigationLoading';
import UnitPointsCalculator from './UnitPointsCalculator';

function Units() {
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isNavigating } = useNavigationLoading();
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogStep, setDialogStep] = useState(1); // 1 = basic info, 2 = attachments
  const [showPointsCalculator, setShowPointsCalculator] = useState(false);
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
    melee: 0,
    ranged: 0,
    morale: 0,
    defense: 0,
    points: 0,
    amount: 1,
    max: 1,
    rules: [],
    availableWeapons: [],
    availableWarGear: [],
    weapons: [],
    warGear: []
  });

  // Rule attachment system
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [showRuleSelector, setShowRuleSelector] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);

  // Weapon attachment system
  const [availableWeapons, setAvailableWeapons] = useState([]);
  const [selectedWeapons, setSelectedWeapons] = useState([]); // Array of { weapon, quantity, type }
  const [weaponSearchTerm, setWeaponSearchTerm] = useState('');
  const [showWeaponSelector, setShowWeaponSelector] = useState(false);
  const [weaponSelectorType, setWeaponSelectorType] = useState(''); // 'melee' or 'ranged'
  const [weaponLoading, setWeaponLoading] = useState(false);

  // WarGear attachment system
  const [availableWarGear, setAvailableWarGear] = useState([]);
  const [selectedWarGear, setSelectedWarGear] = useState([]);
  const [warGearSearchTerm, setWarGearSearchTerm] = useState('');
  const [showWarGearSelector, setShowWarGearSelector] = useState(false);
  const [warGearLoading, setWarGearLoading] = useState(false);

  const loadUnits = useCallback(async (searchQuery = '', showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const params = {
        limit: pageSize,
        skip: skip,
        ...(searchQuery ? { name: searchQuery } : {})
      };
      const data = await unitsAPI.getAll(params);
      setUnits(Array.isArray(data) ? data : []);
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
      setUnits([]);
      setError(null);
      updateTotalItems(0);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [pageSize, skip, updateTotalItems, setLoading]);

  useEffect(() => {
    loadUnits(searchTerm);
  }, [searchTerm, pageSize, skip, loadUnits]); // Include loadUnits dependency

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
    const numericFields = ['melee', 'ranged', 'morale', 'defense', 'points', 'amount', 'max'];
    const numericValue = numericFields.includes(name) ? parseInt(value) || 0 : value;
    
    setFormData(prev => {
      const updated = {
      ...prev,
        [name]: numericValue
      };
      
      // Validation: if changing max, ensure it's >= amount
      if (name === 'max' && numericValue < prev.amount) {
        updated.amount = numericValue;
        // Also clamp weapon quantities
        setSelectedWeapons(weapons => weapons.map(w => ({
          ...w,
          quantity: Math.min(w.quantity, numericValue)
        })));
      }
      
      // Validation: if changing amount, ensure it's <= max
      if (name === 'amount' && numericValue > prev.max) {
        updated.max = numericValue;
      }
      
      // If amount is reduced, clamp weapon quantities
      if (name === 'amount' && numericValue < prev.amount) {
        setSelectedWeapons(weapons => weapons.map(w => ({
          ...w,
          quantity: Math.min(w.quantity, numericValue)
        })));
      }
      
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      melee: 0,
      ranged: 0,
      morale: 0,
      defense: 0,
      points: 0,
      amount: 1,
      max: 1,
      rules: [],
      availableWeapons: [],
      availableWarGear: [],
      weapons: [],
      warGear: []
    });
    setSelectedRules([]);
    setSelectedWeapons([]);
    setSelectedWarGear([]);
    setDialogStep(1); // Reset to first step
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: amount cannot exceed max
    if (formData.amount > formData.max) {
      setError('Number of models cannot exceed maximum');
      return;
    }
    
    // Validation: weapon quantities cannot exceed model count
    if (getTotalWeaponQuantity > formData.amount) {
      setError(`Weapon quantities (${getTotalWeaponQuantity}) exceed model count (${formData.amount})`);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const unitData = {
        ...formData,
        rules: selectedRules
          .filter(rule => rule && rule.id) // Validate rule exists and has ID
          .map(rule => ({
            ruleId: rule.id,
            tier: Math.min(3, Math.max(1, rule.tier || 1)) // Clamp tier to 1-3
          })),
        weapons: selectedWeapons
          .filter(w => w && w.weapon && w.weapon.id) // Validate weapon exists
          .map(w => ({
            weaponId: w.weapon.id,
            quantity: w.quantity,
            type: w.type
          })),
        warGear: selectedWarGear
          .filter(wg => wg && wg.id) // Validate wargear exists
          .map(wg => wg.id)
      };
      
      if (editingUnit) {
        await unitsAPI.update(editingUnit.id, unitData);
      } else {
        await unitsAPI.create(unitData);
      }
      
      await loadUnits(searchTerm, false);
      setShowForm(false);
      setEditingUnit(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save unit');
      console.error('Failed to save unit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name || '',
      type: unit.type || '',
      melee: unit.melee || 0,
      ranged: unit.ranged || 0,
      morale: unit.morale || 0,
      defense: unit.defense || 0,
      points: unit.points || 0,
      amount: unit.amount || 1,
      max: unit.max || 1,
      rules: unit.rules || [],
      availableWeapons: unit.availableWeapons || [],
      availableWarGear: unit.availableWarGear || [],
      weapons: unit.weapons || [],
      warGear: unit.warGear || []
    });
    
    // Load selected rules for editing - populate with full rule data
    if (unit.rules && unit.rules.length > 0) {
      try {
        const rulePromises = unit.rules.map(async (ruleRef) => {
          const fullRule = await rulesAPI.getById(ruleRef.ruleId || ruleRef.id);
          return {
            ...fullRule,
            tier: ruleRef.tier || 1
          };
        });
        const populatedRules = await Promise.all(rulePromises);
        setSelectedRules(populatedRules);
      } catch (err) {
        console.error('Failed to load rule details:', err);
        setSelectedRules([]);
      }
    } else {
      setSelectedRules([]);
    }
    
    // Load selected weapons for editing (handle both ID arrays and populated objects)
    if (unit.weapons && unit.weapons.length > 0) {
      if (typeof unit.weapons[0] === 'object' && unit.weapons[0].weapon) {
        // Already in correct format {weapon, quantity, type}
        setSelectedWeapons(unit.weapons);
      } else {
        // Array of IDs or simple objects - initialize with default values
        setSelectedWeapons([]);
      }
    } else {
      setSelectedWeapons([]);
    }
    
    // Load selected wargear for editing (handle both ID arrays and populated objects)
    if (unit.warGear && unit.warGear.length > 0) {
      if (typeof unit.warGear[0] === 'object' && unit.warGear[0].id) {
        // Array of populated objects
        setSelectedWarGear(unit.warGear);
      } else {
        // Array of IDs - initialize empty
        setSelectedWarGear([]);
      }
    } else {
      setSelectedWarGear([]);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const unit = units.find(u => u.id === id);
    const hasWeapons = unit?.weapons?.length > 0;
    const hasWarGear = unit?.warGear?.length > 0;
    const hasRules = unit?.rules?.length > 0;
    
    let confirmMessage = 'Are you sure you want to delete this unit?';
    if (hasWeapons || hasWarGear || hasRules) {
      confirmMessage += '\n\n⚠️ This unit has:\n';
      if (hasWeapons) confirmMessage += `- ${unit.weapons.length} weapon(s)\n`;
      if (hasWarGear) confirmMessage += `- ${unit.warGear.length} wargear item(s)\n`;
      if (hasRules) confirmMessage += `- ${unit.rules.length} rule(s)\n`;
      confirmMessage += '\nThese references will be removed.';
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await unitsAPI.delete(id);
        setError(null); // Clear any previous errors
        
        // Check if we're on the last page and this is the only item
        const isLastPage = currentPage === totalPages;
        const isOnlyItemOnPage = units.length === 1;
        
        if (isLastPage && isOnlyItemOnPage && currentPage > 1) {
          // Reset to first page when deleting the last item
          resetPagination();
        }
        
        loadUnits(searchTerm, false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete unit');
        console.error('Failed to delete unit:', err);
      }
    }
  };

  // Rule loading and selection functions
  const loadRules = useCallback(async (query = '') => {
    try {
      setRuleLoading(true);
      // Load all rules - no type filtering needed
      const rules = await rulesAPI.getAll({ name: query, limit: 20 });
      setAvailableRules(Array.isArray(rules) ? rules : []);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setAvailableRules([]);
    } finally {
      setRuleLoading(false);
    }
  }, []);


  const handleRuleSelect = async (rule, tier = 1) => {
    try {
      // Check if rule is already selected
      const isAlreadySelected = selectedRules.some(r => r.id === rule.id);
      if (isAlreadySelected) {
        return;
      }

      // Add rule with tier
      const ruleWithTier = { ...rule, tier };
      setSelectedRules(prev => [...prev, ruleWithTier]);
      
      // Close the rule selector dialog and return to step 2
      setShowRuleSelector(false);
      setRuleSearchTerm('');
      setAvailableRules([]);
    } catch (err) {
      console.error('Failed to select rule:', err);
    }
  };

  const handleRuleRemove = async (ruleId) => {
    try {
      // Remove from selected rules
      setSelectedRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      console.error('Failed to remove rule:', err);
    }
  };

  const handleRuleSearch = (e) => {
    const query = e.target.value;
    setRuleSearchTerm(query);
    
    // Load full results based on query length
    if (query.length === 0) {
      // When search is cleared, reload all rules
      loadRules('');
    } else if (query.length > 2) {
      // Load filtered rules when query is long enough
      loadRules(query);
    } else {
      // For 1-2 characters, still load all to allow dropdown selection
      loadRules('');
    }
  };

  // Weapon loading and selection functions
  const loadWeapons = useCallback(async (query = '', type = '') => {
    try {
      setWeaponLoading(true);
      const response = await weaponsAPI.getAll({ name: query, limit: 20 });
      const weapons = response.data || response; // Handle both new and old format
      
      // Filter by weapon type if specified (case-insensitive)
      // Only show weapons that match the selector type (melee/ranged)
      const filteredWeapons = Array.isArray(weapons) 
        ? (type ? weapons.filter(w => w.type && w.type.toLowerCase() === type.toLowerCase()) : weapons)
        : [];
      
      setAvailableWeapons(filteredWeapons);
    } catch (err) {
      console.error('Failed to load weapons:', err);
      setAvailableWeapons([]);
    } finally {
      setWeaponLoading(false);
    }
  }, []);




  const handleWeaponSelect = async (weapon, quantity = 1) => {
    try {
      // Check if weapon is already selected
      const isAlreadySelected = selectedWeapons.some(w => w.weapon.id === weapon.id);
      if (isAlreadySelected) {
        return;
      }

      // Check if we already have 3 weapons of this type
      const weaponsOfType = weaponSelectorType.toLowerCase() === 'melee' ? getMeleeWeapons : getRangedWeapons;
      if (weaponsOfType.length >= 3) {
        alert(`You can only attach up to 3 ${weaponSelectorType} weapons.`);
        return;
      }

      // Validate weapon type matches selector type (case-insensitive)
      if (weapon.type && weapon.type.toLowerCase() !== weaponSelectorType.toLowerCase()) {
        alert(`Selected weapon type (${weapon.type}) doesn't match selector type (${weaponSelectorType})`);
        return;
      }

      // Add weapon with quantity and type
      setSelectedWeapons(prev => [...prev, { 
        weapon, 
        quantity: Math.min(quantity, formData.amount || 1),
        type: weaponSelectorType 
      }]);
      
      // Clear search and close
      closeWeaponSelector();
    } catch (err) {
      console.error('Failed to select weapon:', err);
    }
  };

  const handleWeaponRemove = async (weaponId) => {
    try {
      setSelectedWeapons(prev => prev.filter(w => w.weapon.id !== weaponId));
    } catch (err) {
      console.error('Failed to remove weapon:', err);
    }
  };

  const handleWeaponQuantityChange = (weaponId, newQuantity) => {
    setSelectedWeapons(prev => prev.map(w => 
      w.weapon.id === weaponId 
        ? { ...w, quantity: Math.max(0, Math.min(newQuantity, formData.amount || 1)) }
        : w
    ));
  };

  const getTotalWeaponQuantity = useMemo(() => {
    return selectedWeapons.reduce((sum, w) => sum + w.quantity, 0);
  }, [selectedWeapons]);

  const getMeleeWeapons = useMemo(() => 
    selectedWeapons.filter(w => w.type && w.type.toLowerCase() === 'melee'),
    [selectedWeapons]
  );
  
  const getRangedWeapons = useMemo(() => 
    selectedWeapons.filter(w => w.type && w.type.toLowerCase() === 'ranged'),
    [selectedWeapons]
  );

  // Cleanup functions for closing selectors
  const closeWeaponSelector = () => {
    setShowWeaponSelector(false);
    setWeaponSearchTerm('');
    setAvailableWeapons([]);
    setWeaponSelectorType('');
  };

  const closeWarGearSelector = () => {
    setShowWarGearSelector(false);
    setWarGearSearchTerm('');
    setAvailableWarGear([]);
  };

  const closeRuleSelector = () => {
    setShowRuleSelector(false);
    setRuleSearchTerm('');
    setAvailableRules([]);
  };

  const handleWeaponSearch = (e) => {
    const query = e.target.value;
    setWeaponSearchTerm(query);
    
    // Load full results based on query length
    if (query.length === 0) {
      // When search is cleared, reload all weapons of the selected type
      loadWeapons('', weaponSelectorType);
    } else if (query.length > 2) {
      // Load filtered weapons when query is long enough
      loadWeapons(query, weaponSelectorType);
    } else {
      // For 1-2 characters, still load all to allow dropdown selection
      loadWeapons('', weaponSelectorType);
    }
  };

  // WarGear loading and selection functions
  const loadWarGear = useCallback(async (query = '') => {
    try {
      setWarGearLoading(true);
      const wargear = await wargearAPI.getAll({ name: query, limit: 50 });
      setAvailableWarGear(Array.isArray(wargear) ? wargear : []);
    } catch (err) {
      console.error('Failed to load wargear:', err);
      setAvailableWarGear([]);
    } finally {
      setWarGearLoading(false);
    }
  }, []);

  // Load initial rules when dialog opens
  useEffect(() => {
    if (showRuleSelector) {
      loadRules(''); // Load all rules initially
    }
  }, [showRuleSelector, loadRules]);

  // Load initial wargear when dialog opens
  useEffect(() => {
    if (showWarGearSelector) {
      loadWarGear(''); // Load all wargear initially
    }
  }, [showWarGearSelector, loadWarGear]);


  // Load initial weapons when dialog opens
  useEffect(() => {
    if (showWeaponSelector) {
      loadWeapons('', weaponSelectorType); // Load weapons of the selected type initially
    }
  }, [showWeaponSelector, weaponSelectorType, loadWeapons]);

  const handleWarGearSelect = async (wargear) => {
    try {
      // Check if wargear is already selected
      const isAlreadySelected = selectedWarGear.some(w => w.id === wargear.id);
      if (isAlreadySelected) {
        return;
      }

      setSelectedWarGear(prev => [...prev, wargear]);
      
      // Close the wargear selector dialog and return to step 2
      setShowWarGearSelector(false);
      setWarGearSearchTerm('');
      setAvailableWarGear([]);
    } catch (err) {
      console.error('Failed to select wargear:', err);
    }
  };

  const handleWarGearRemove = async (wargearId) => {
    try {
      setSelectedWarGear(prev => prev.filter(wargear => wargear.id !== wargearId));
    } catch (err) {
      console.error('Failed to remove wargear:', err);
    }
  };

  const handleWarGearSearch = (e) => {
    const query = e.target.value;
    setWarGearSearchTerm(query);
    
    // Load full results based on query length
    if (query.length === 0) {
      // When search is cleared, reload all wargear
      loadWarGear('');
    } else if (query.length > 2) {
      // Load filtered wargear when query is long enough
      loadWarGear(query);
    } else {
      // Clear results for 1-2 character queries to avoid too many results
      setAvailableWarGear([]);
    }
  };

  // Don't show loading message during navigation - show content immediately
  if (loading && !isNavigating) return <div className="loading">Loading units...</div>;

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
                  setError(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            {error && (
              <div style={{
                backgroundColor: '#490202',
                color: '#f85149',
                padding: '0.75rem 1.5rem',
                borderBottom: '1px solid #da3633',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {dialogStep === 1 && (
                <div>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#161b22', borderRadius: '6px', border: '1px solid #30363d' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#f0f6fc', fontSize: '1.1rem' }}>Step 1: Basic Information</h4>
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
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Infantry">Infantry</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Leader">Leader</option>
                  <option value="Monster">Monster</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
              
              <div className="nested-form">
                <h4>Combat Stats</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group">
                    <label>Melee</label>
                    <input
                      type="number"
                      name="melee"
                      value={formData.melee}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ranged</label>
                    <input
                      type="number"
                      name="ranged"
                      value={formData.ranged}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Morale</label>
                    <input
                      type="number"
                      name="morale"
                      value={formData.morale}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Defense</label>
                    <input
                      type="number"
                      name="defense"
                      value={formData.defense}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Points</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="0"
                    style={{ flex: '0 0 120px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPointsCalculator(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#238636',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      flex: '1',
                      minWidth: '140px'
                    }}
                    title="Calculate Unit Points"
                  >
                    🧮 Calculate
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Models in Unit</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="1"
                    max={formData.max || 1}
                  />
                </div>
                <div className="form-group">
                  <label>Max Models</label>
                  <input
                    type="number"
                    name="max"
                    value={formData.max}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
                  </div>
                  
                  {/* Step 1 Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowForm(false);
                        setEditingUnit(null);
                        setError(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setDialogStep(2)}
                      disabled={!formData.name || !formData.type}
                    >
                      Next: Attachments →
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Attachments */}
              {dialogStep === 2 && (
                <div>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#161b22', borderRadius: '6px', border: '1px solid #30363d' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#f0f6fc', fontSize: '1.1rem' }}>Step 2: Attachments</h4>
              
              
              <div className="form-group">
                <label>Rules</label>
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowRuleSelector(true)}
                    style={{
                      backgroundColor: '#238636',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    + Attach Rules
                  </button>
                </div>
                
                {selectedRules.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>Attached Rules:</h4>
                    
                    {/* Rule Tags */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      {selectedRules.map(rule => (
                        <div
                          key={rule.id}
                          style={{
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            position: 'relative',
                            cursor: 'default'
                          }}
                          title={rule.description} // Hover tooltip
                        >
                          <span style={{ color: '#f0f6fc' }}>
                            {rule.name}
                          </span>
                          {rule.points && rule.points.length > 0 && (
                            <span style={{ 
                              color: '#58a6ff', 
                              fontSize: '0.75rem',
                              backgroundColor: '#0d1117',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '10px'
                            }}>
                              {(() => {
                                if (rule.tier && rule.tier >= 1 && rule.tier <= rule.points.length) {
                                  return rule.points[rule.tier - 1];
                                } else {
                                  return rule.points[0]; // Default to tier 1
                                }
                              })()}
                            </span>
                          )}
                          {rule.tier && (
                            <span style={{ 
                              color: '#f0f6fc', 
                              fontSize: '0.7rem',
                              backgroundColor: '#30363d',
                              padding: '0.1rem 0.3rem',
                              borderRadius: '8px',
                              marginLeft: '0.25rem'
                            }}>
                              T{rule.tier}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRuleRemove(rule.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#f85149',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '0.1rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%'
                            }}
                            title="Remove rule"
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f85149'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Melee Weapons Section */}
              <div className="form-group">
                <label>Melee Weapons (Max 3)</label>
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setWeaponSelectorType('melee');
                      setShowWeaponSelector(true);
                    }}
                    style={{
                      backgroundColor: getMeleeWeapons.length >= 3 ? '#6e7681' : '#238636',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: getMeleeWeapons.length >= 3 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      opacity: getMeleeWeapons.length >= 3 ? 0.6 : 1
                    }}
                    disabled={getMeleeWeapons.length >= 3}
                    title={getMeleeWeapons.length >= 3 ? 'Maximum melee weapons reached' : ''}
                  >
                    + Attach Melee Weapon {getMeleeWeapons.length > 0 ? `(${getMeleeWeapons.length}/3)` : ''}
                  </button>
                </div>
                
                {getMeleeWeapons.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>Attached Melee Weapons:</h4>
                    
                    {/* Weapon Cards with Quantity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {getMeleeWeapons.map(({ weapon, quantity }) => (
                        <div
                          key={weapon.id}
                          style={{
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#f0f6fc', fontWeight: 'bold' }}>
                              {weapon.name}
                            </div>
                            <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
                              Range: {weapon.range}", Attacks: {weapon.attacks}, AP: {weapon.ap}
                              {weapon.points && ` • ${weapon.points} pts`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ color: '#8b949e', fontSize: '0.85rem' }}>Models:</label>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => handleWeaponQuantityChange(weapon.id, parseInt(e.target.value) || 0)}
                              min="0"
                              max={formData.amount}
                              style={{
                                width: '60px',
                                padding: '0.25rem',
                                backgroundColor: '#0d1117',
                                border: '1px solid #30363d',
                                borderRadius: '4px',
                                color: '#f0f6fc',
                                textAlign: 'center'
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWeaponRemove(weapon.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#f85149',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '0.25rem',
                              lineHeight: 1
                            }}
                            title="Remove weapon"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ranged Weapons Section */}
              <div className="form-group">
                <label>Ranged Weapons (Max 3)</label>
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setWeaponSelectorType('ranged');
                      setShowWeaponSelector(true);
                    }}
                    style={{
                      backgroundColor: getRangedWeapons.length >= 3 ? '#6e7681' : '#238636',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: getRangedWeapons.length >= 3 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      opacity: getRangedWeapons.length >= 3 ? 0.6 : 1
                    }}
                    disabled={getRangedWeapons.length >= 3}
                    title={getRangedWeapons.length >= 3 ? 'Maximum ranged weapons reached' : ''}
                  >
                    + Attach Ranged Weapon {getRangedWeapons.length > 0 ? `(${getRangedWeapons.length}/3)` : ''}
                  </button>
                </div>
                
                {getRangedWeapons.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>Attached Ranged Weapons:</h4>
                    
                    {/* Weapon Cards with Quantity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {getRangedWeapons.map(({ weapon, quantity }) => (
                        <div
                          key={weapon.id}
                          style={{
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#f0f6fc', fontWeight: 'bold' }}>
                              {weapon.name}
                            </div>
                            <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
                              Range: {weapon.range}", Attacks: {weapon.attacks}, AP: {weapon.ap}
                              {weapon.points && ` • ${weapon.points} pts`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ color: '#8b949e', fontSize: '0.85rem' }}>Models:</label>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => handleWeaponQuantityChange(weapon.id, parseInt(e.target.value) || 0)}
                              min="0"
                              max={formData.amount}
                              style={{
                                width: '60px',
                                padding: '0.25rem',
                                backgroundColor: '#0d1117',
                                border: '1px solid #30363d',
                                borderRadius: '4px',
                                color: '#f0f6fc',
                                textAlign: 'center'
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWeaponRemove(weapon.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#f85149',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '0.25rem',
                              lineHeight: 1
                            }}
                            title="Remove weapon"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Total Weapons Counter */}
                {selectedWeapons.length > 0 && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.5rem 0.75rem', 
                    backgroundColor: getTotalWeaponQuantity > formData.amount ? '#490202' : '#0d1117',
                    border: `1px solid ${getTotalWeaponQuantity > formData.amount ? '#da3633' : '#30363d'}`,
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ color: getTotalWeaponQuantity > formData.amount ? '#f85149' : '#8b949e' }}>
                      Total models with weapons: {getTotalWeaponQuantity} / {formData.amount}
                    </span>
                    {getTotalWeaponQuantity > formData.amount && (
                      <div style={{ color: '#f85149', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Warning: Weapon quantities exceed model count
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>WarGear</label>
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowWarGearSelector(true)}
                    style={{
                      backgroundColor: '#238636',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    + Attach WarGear
                  </button>
                </div>
                
                {selectedWarGear.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f0f6fc' }}>Attached WarGear:</h4>
                    
                    {/* WarGear Tags */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      {selectedWarGear.map(wargear => (
                        <div
                          key={wargear.id}
                          style={{
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            position: 'relative',
                            cursor: 'default'
                          }}
                          title={wargear.description || wargear.name}
                        >
                          <span style={{ color: '#f0f6fc' }}>
                            {wargear.name}
                          </span>
                          {wargear.points && (
                            <span style={{ 
                              color: '#58a6ff', 
                              fontSize: '0.75rem',
                              backgroundColor: '#0d1117',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '10px'
                            }}>
                              {wargear.points} pts
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleWarGearRemove(wargear.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#f85149',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '0.1rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%'
                            }}
                            title="Remove wargear"
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f85149'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
                  </div>
                  
                  {/* Step 2 Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setDialogStep(1)}
                    >
                      ← Back to Basic Info
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowForm(false);
                          setEditingUnit(null);
                          setError(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{
                          opacity: submitting ? 0.6 : 1,
                          cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {submitting ? 'Saving...' : (editingUnit ? 'Update' : 'Create') + ' Unit'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
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
                <th>Melee</th>
                <th>Ranged</th>
                <th>Morale</th>
                <th>Defense</th>
                <th>Points</th>
                <th>Models</th>
                <th>Max</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td>{unit.name}</td>
                  <td>{unit.type}</td>
                  <td>{unit.melee || 0}</td>
                  <td>{unit.ranged || 0}</td>
                  <td>{unit.morale || 0}</td>
                  <td>{unit.defense || 0}</td>
                  <td>{unit.points}</td>
                  <td>{unit.amount || 1}</td>
                  <td>{unit.max || 1}</td>
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
                        title="Edit"
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
        {units && units.length > 0 && (
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

      {/* Rule Selector - appears on top of unit form */}
      {showRuleSelector && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeRuleSelector();
            }
          }}
        >
          <div 
            style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#f0f6fc', margin: 0 }}>Select Rules to Attach</h3>
              <button
                onClick={closeRuleSelector}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f0f6fc',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Search and Filter Rules
              </label>
              <input
                type="text"
                placeholder="Type to filter rules..."
                value={ruleSearchTerm}
                onChange={handleRuleSearch}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#f0f6fc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
            
            {/* Dropdown-style rule selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Select Rule from List
              </label>
              {ruleLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  Loading rules...
                </div>
              ) : availableRules.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  {ruleSearchTerm ? `No rules found matching "${ruleSearchTerm}".` : 'No rules available.'}
                </div>
              ) : (
                <select
                  id="rule-dropdown-selector"
                  size="8"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    color: '#f0f6fc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    const selectedRule = availableRules.find(r => r.id === e.target.value);
                    if (selectedRule) {
                      document.getElementById('selected-rule-id').value = selectedRule.id;
                      document.getElementById('selected-rule-name').textContent = selectedRule.name;
                      document.getElementById('selected-rule-description').textContent = selectedRule.description;
                    }
                  }}
                >
                  {availableRules.map(rule => (
                    <option 
                      key={rule.id} 
                      value={rule.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#21262d',
                        color: '#f0f6fc',
                        cursor: 'pointer'
                      }}
                    >
                      {rule.name}{rule.points && rule.points.length > 0 ? ` (${rule.points[0]}/${rule.points[1]}/${rule.points[2]} pts)` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Selected rule details and add button */}
            {availableRules.length > 0 && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <input type="hidden" id="selected-rule-id" />
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Selected Rule:
                  </div>
                  <div id="selected-rule-name" style={{ color: '#f0f6fc', fontWeight: 'bold', fontSize: '1rem' }}>
                    {availableRules[0]?.name || 'None'}
                  </div>
                  <div id="selected-rule-description" style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {availableRules[0]?.description || ''}
                  </div>
                </div>
                
                {/* Tier selection and add button */}
                <div>
                  {availableRules[0] && availableRules[0].points && availableRules[0].points.length > 0 ? (
                    <>
                      <label style={{ display: 'block', color: '#8b949e', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        Select Tier:
                      </label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {[1, 2, 3].map(tier => (
                          <button
                            key={tier}
                            onClick={() => {
                              const ruleId = document.getElementById('selected-rule-id')?.value || availableRules[0]?.id;
                              const selectedRule = availableRules.find(r => r.id === ruleId) || availableRules[0];
                              if (selectedRule) {
                                handleRuleSelect(selectedRule, tier);
                              }
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: '#238636',
                              color: 'white',
                              border: 'none',
                              padding: '0.65rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                          >
                            Tier {tier} ({availableRules[0].points[tier-1]} pts)
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        const ruleId = document.getElementById('selected-rule-id')?.value || availableRules[0]?.id;
                        const selectedRule = availableRules.find(r => r.id === ruleId) || availableRules[0];
                        if (selectedRule) {
                          handleRuleSelect(selectedRule, 1);
                        }
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#238636',
                        color: 'white',
                        border: 'none',
                        padding: '0.65rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                    >
                      Add Rule
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weapon Selector - appears on top of unit form */}
      {showWeaponSelector && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeWeaponSelector();
            }
          }}
        >
          <div 
            style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#f0f6fc', margin: 0 }}>Select {weaponSelectorType.charAt(0).toUpperCase() + weaponSelectorType.slice(1)} Weapons to Attach</h3>
              <button
                onClick={closeWeaponSelector}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f0f6fc',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            {/* Info box */}
            <div style={{
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              color: '#8b949e'
            }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong style={{ color: '#f0f6fc' }}>Unit Info:</strong> {formData.amount} model{formData.amount !== 1 ? 's' : ''}
              </div>
              <div>
                <strong style={{ color: '#f0f6fc' }}>Limit:</strong> Up to 3 {weaponSelectorType.toLowerCase()} weapons per unit
              </div>
              {getRangedWeapons.length + getMeleeWeapons.length > 0 && (
                <div style={{ marginTop: '0.25rem', color: getTotalWeaponQuantity > formData.amount ? '#f85149' : '#58a6ff' }}>
                  Total weapons assigned: {getTotalWeaponQuantity} / {formData.amount} models
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Search and Filter Weapons
              </label>
              <input
                type="text"
                placeholder={`Type to filter ${weaponSelectorType.toLowerCase()} weapons...`}
                value={weaponSearchTerm}
                onChange={handleWeaponSearch}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#f0f6fc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
            
            {/* Dropdown-style weapon selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Select Weapon from List
              </label>
              {weaponLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  Loading {weaponSelectorType.toLowerCase()} weapons...
                </div>
              ) : availableWeapons.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  {weaponSearchTerm ? `No ${weaponSelectorType.toLowerCase()} weapons found matching "${weaponSearchTerm}".` : `No ${weaponSelectorType.toLowerCase()} weapons available.`}
                </div>
              ) : (
                <select
                  id="weapon-dropdown-selector"
                  size="8"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    color: '#f0f6fc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    const selectedWeapon = availableWeapons.find(w => w.id === e.target.value);
                    if (selectedWeapon) {
                      document.getElementById('selected-weapon-id').value = selectedWeapon.id;
                      document.getElementById('selected-weapon-name').textContent = selectedWeapon.name;
                      document.getElementById('selected-weapon-details').textContent = 
                        `${selectedWeapon.type} - Range: ${selectedWeapon.range}", Attacks: ${selectedWeapon.attacks}, AP: ${selectedWeapon.ap}${selectedWeapon.points ? ` | ${selectedWeapon.points} pts` : ''}`;
                    }
                  }}
                >
                  {availableWeapons.map(weapon => (
                    <option 
                      key={weapon.id} 
                      value={weapon.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#21262d',
                        color: '#f0f6fc',
                        cursor: 'pointer'
                      }}
                    >
                      {weapon.name} - Range: {weapon.range}", Atk: {weapon.attacks}, AP: {weapon.ap}{weapon.points ? ` (${weapon.points} pts)` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Selected weapon details and add button */}
            {availableWeapons.length > 0 && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <input type="hidden" id="selected-weapon-id" />
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Selected Weapon:
                  </div>
                  <div id="selected-weapon-name" style={{ color: '#f0f6fc', fontWeight: 'bold', fontSize: '1rem' }}>
                    {availableWeapons[0]?.name || 'None'}
                  </div>
                  <div id="selected-weapon-details" style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {availableWeapons[0] && `${availableWeapons[0].type} - Range: ${availableWeapons[0].range}", Attacks: ${availableWeapons[0].attacks}, AP: ${availableWeapons[0].ap}${availableWeapons[0].points ? ` | ${availableWeapons[0].points} pts` : ''}`}
                  </div>
                </div>
                
                {/* Quantity selection and add button */}
                <div>
                  <label style={{ display: 'block', color: '#8b949e', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Number of models with this weapon:
                  </label>
                  <input
                    type="number"
                    id="weapon-quantity-input"
                    defaultValue="1"
                    min="1"
                    max={formData.amount}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#21262d',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      color: '#f0f6fc',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <button
                    onClick={() => {
                      const weaponId = document.getElementById('selected-weapon-id')?.value || availableWeapons[0]?.id;
                      const quantity = parseInt(document.getElementById('weapon-quantity-input')?.value || 1);
                      const selectedWeapon = availableWeapons.find(w => w.id === weaponId) || availableWeapons[0];
                      if (selectedWeapon) {
                        handleWeaponSelect(selectedWeapon, quantity);
                      }
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#238636',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                  >
                    Add Weapon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WarGear Selector - appears on top of unit form */}
      {showWarGearSelector && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeWarGearSelector();
            }
          }}
        >
          <div 
            style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#f0f6fc', margin: 0 }}>Select WarGear to Attach</h3>
              <button
                onClick={closeWarGearSelector}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f0f6fc',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Search and Filter WarGear
              </label>
              <input
                type="text"
                placeholder="Type to filter wargear..."
                value={warGearSearchTerm}
                onChange={handleWarGearSearch}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#f0f6fc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
            
            {/* Dropdown-style wargear selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8b949e', fontSize: '0.85rem' }}>
                Select WarGear from List
              </label>
              {warGearLoading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  Loading wargear...
                </div>
              ) : availableWarGear.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#8b949e',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px'
                }}>
                  {warGearSearchTerm ? `No wargear found matching "${warGearSearchTerm}".` : 'No wargear available.'}
                </div>
              ) : (
                <select
                  id="wargear-dropdown-selector"
                  size="8"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    color: '#f0f6fc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    const selectedWarGear = availableWarGear.find(w => w.id === e.target.value);
                    if (selectedWarGear) {
                      document.getElementById('selected-wargear-id').value = selectedWarGear.id;
                      document.getElementById('selected-wargear-name').textContent = selectedWarGear.name;
                      document.getElementById('selected-wargear-description').textContent = selectedWarGear.description || 'No description';
                    }
                  }}
                >
                  {availableWarGear.map(wargear => (
                    <option 
                      key={wargear.id} 
                      value={wargear.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#21262d',
                        color: '#f0f6fc',
                        cursor: 'pointer'
                      }}
                    >
                      {wargear.name}{wargear.points ? ` (${wargear.points} pts)` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Selected wargear details and attach button */}
            {availableWarGear.length > 0 && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}>
                <input type="hidden" id="selected-wargear-id" />
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Selected WarGear:
                  </div>
                  <div id="selected-wargear-name" style={{ color: '#f0f6fc', fontWeight: 'bold', fontSize: '1rem' }}>
                    {availableWarGear[0]?.name || 'None'}
                  </div>
                  <div id="selected-wargear-description" style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {availableWarGear[0]?.description || 'No description'}
                  </div>
                  {availableWarGear[0]?.points && (
                    <div style={{ color: '#58a6ff', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 'bold' }}>
                      {availableWarGear[0].points} points
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    const wargearId = document.getElementById('selected-wargear-id')?.value || availableWarGear[0]?.id;
                    const selectedWarGear = availableWarGear.find(w => w.id === wargearId) || availableWarGear[0];
                    if (selectedWarGear) {
                      handleWarGearSelect(selectedWarGear);
                    }
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#238636',
                    color: 'white',
                    border: 'none',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2ea043'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#238636'}
                >
                  Attach WarGear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showPointsCalculator && (
        <UnitPointsCalculator
          unit={formData}
          onPointsCalculated={(points) => {
            setFormData(prev => ({ ...prev, points }));
            setShowPointsCalculator(false);
          }}
          onClose={() => setShowPointsCalculator(false)}
        />
      )}
    </div>
  );
}

export default Units;