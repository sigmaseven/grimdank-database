import React, { useState, useEffect } from 'react';

function RuleAttachmentModal({ unit, availableRules, onClose, onSave }) {
  const [selectedRules, setSelectedRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (unit && unit.rules) {
      setSelectedRules([...unit.rules]);
    }
  }, [unit]);

  const handleRuleSelect = (ruleId) => {
    const rule = availableRules.find(r => r.id === ruleId);
    if (rule && !selectedRules.find(r => r.ruleId === ruleId)) {
      setSelectedRules([...selectedRules, { ruleId: ruleId, tier: 1 }]);
    }
  };

  const handleTierChange = (ruleId, tier) => {
    setSelectedRules(selectedRules.map(rule => 
      rule.ruleId === ruleId ? { ...rule, tier: parseInt(tier) } : rule
    ));
  };

  const handleRuleRemove = (ruleId) => {
    setSelectedRules(selectedRules.filter(rule => rule.ruleId !== ruleId));
  };

  const handleSave = () => {
    onSave(unit.id, selectedRules);
    onClose();
  };

  const filteredRules = availableRules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!unit) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Attach Rules to {unit.name}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="rules-section">
            <div className="available-rules">
              <h3>Available Rules</h3>
              <select
                value=""
                onChange={(e) => handleRuleSelect(e.target.value)}
                className="rule-select"
              >
                <option value="">Select Rule</option>
                {filteredRules.map(rule => (
                  <option key={rule.id} value={rule.id}>
                    {rule.name}{rule.points && rule.points.length > 0 ? ` (${rule.points[0]}/${rule.points[1]}/${rule.points[2]} pts)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="selected-rules">
              <h3>Selected Rules</h3>
              {selectedRules.map(rule => {
                const ruleData = availableRules.find(r => r.id === rule.ruleId);
                return (
                  <div key={rule.ruleId} className="selected-rule">
                    <div className="rule-info">
                      <span className="rule-name">{ruleData?.name || 'Unknown Rule'}</span>
                      <div className="tier-control">
                        <label>Tier:</label>
                        <select
                          value={rule.tier}
                          onChange={(e) => handleTierChange(rule.ruleId, e.target.value)}
                          className="tier-select"
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRuleRemove(rule.ruleId)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleSave} className="btn btn-primary">
            Save Rules
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RuleAttachmentModal;
