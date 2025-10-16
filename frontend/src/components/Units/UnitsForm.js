import React from 'react';

function UnitsForm({ 
  formData, 
  validationErrors, 
  onInputChange, 
  onSubmit, 
  onCancel,
  editingUnit,
  availableRules,
  availableWeapons,
  availableWargear,
  selectedRules,
  selectedWeapons,
  selectedWargear,
  onRuleSelect,
  onWeaponSelect,
  onWargearSelect,
  onRuleRemove,
  onWeaponRemove,
  onWargearRemove
}) {
  return (
    <div className="units-form">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            required
            className={validationErrors.name ? 'error' : ''}
          />
          {validationErrors.name && (
            <div className="error-message">{validationErrors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label>Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={onInputChange}
            required
            className={validationErrors.type ? 'error' : ''}
          >
            <option value="">Select Type</option>
            <option value="infantry">Infantry</option>
            <option value="cavalry">Cavalry</option>
            <option value="vehicle">Vehicle</option>
            <option value="monster">Monster</option>
            <option value="character">Character</option>
          </select>
          {validationErrors.type && (
            <div className="error-message">{validationErrors.type}</div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Melee *</label>
            <input
              type="number"
              name="melee"
              value={formData.melee}
              onChange={onInputChange}
              required
              min="1"
              max="10"
              className={validationErrors.melee ? 'error' : ''}
            />
            {validationErrors.melee && (
              <div className="error-message">{validationErrors.melee}</div>
            )}
          </div>

          <div className="form-group">
            <label>Ranged *</label>
            <input
              type="number"
              name="ranged"
              value={formData.ranged}
              onChange={onInputChange}
              required
              min="1"
              max="10"
              className={validationErrors.ranged ? 'error' : ''}
            />
            {validationErrors.ranged && (
              <div className="error-message">{validationErrors.ranged}</div>
            )}
          </div>

          <div className="form-group">
            <label>Morale *</label>
            <input
              type="number"
              name="morale"
              value={formData.morale}
              onChange={onInputChange}
              required
              min="1"
              max="10"
              className={validationErrors.morale ? 'error' : ''}
            />
            {validationErrors.morale && (
              <div className="error-message">{validationErrors.morale}</div>
            )}
          </div>

          <div className="form-group">
            <label>Defense *</label>
            <input
              type="number"
              name="defense"
              value={formData.defense}
              onChange={onInputChange}
              required
              min="1"
              max="10"
              className={validationErrors.defense ? 'error' : ''}
            />
            {validationErrors.defense && (
              <div className="error-message">{validationErrors.defense}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Points *</label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={onInputChange}
              required
              min="0"
              className={validationErrors.points ? 'error' : ''}
            />
            {validationErrors.points && (
              <div className="error-message">{validationErrors.points}</div>
            )}
          </div>

          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={onInputChange}
              required
              min="1"
              className={validationErrors.amount ? 'error' : ''}
            />
            {validationErrors.amount && (
              <div className="error-message">{validationErrors.amount}</div>
            )}
          </div>

          <div className="form-group">
            <label>Max *</label>
            <input
              type="number"
              name="max"
              value={formData.max}
              onChange={onInputChange}
              required
              min="1"
              className={validationErrors.max ? 'error' : ''}
            />
            {validationErrors.max && (
              <div className="error-message">{validationErrors.max}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Rules</label>
          <select
            name="ruleSelect"
            value=""
            onChange={onRuleSelect}
            className="rule-select"
          >
            <option value="">Select Rule</option>
            {availableRules.map(rule => (
              <option key={rule.id} value={rule.id}>
                {rule.name}{rule.points && rule.points.length > 0 ? ` (${rule.points[0]}/${rule.points[1]}/${rule.points[2]} pts)` : ''}
              </option>
            ))}
          </select>
          <div className="selected-rules">
            {selectedRules.map(rule => (
              <div key={rule.id} className="selected-item">
                <span>{rule.name} (Tier {rule.tier})</span>
                <button
                  type="button"
                  onClick={() => onRuleRemove(rule.id)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Available Weapons</label>
          <select
            name="weaponSelect"
            value=""
            onChange={onWeaponSelect}
            className="weapon-select"
          >
            <option value="">Select Weapon</option>
            {availableWeapons.map(weapon => (
              <option key={weapon.id} value={weapon.id}>
                {weapon.name} ({weapon.points} pts)
              </option>
            ))}
          </select>
          <div className="selected-weapons">
            {selectedWeapons.map(weapon => (
              <div key={weapon.id} className="selected-item">
                <span>{weapon.name} x{weapon.quantity}</span>
                <button
                  type="button"
                  onClick={() => onWeaponRemove(weapon.id)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Available WarGear</label>
          <select
            name="wargearSelect"
            value=""
            onChange={onWargearSelect}
            className="wargear-select"
          >
            <option value="">Select WarGear</option>
            {availableWargear.map(wargear => (
              <option key={wargear.id} value={wargear.id}>
                {wargear.name} ({wargear.points} pts)
              </option>
            ))}
          </select>
          <div className="selected-wargear">
            {selectedWargear.map(wargear => (
              <div key={wargear.id} className="selected-item">
                <span>{wargear.name}</span>
                <button
                  type="button"
                  onClick={() => onWargearRemove(wargear.id)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingUnit ? 'Update Unit' : 'Create Unit'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UnitsForm;
