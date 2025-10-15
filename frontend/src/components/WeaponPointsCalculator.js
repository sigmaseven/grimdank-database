import React, { useState, useEffect, useCallback } from 'react';

function WeaponPointsCalculator({ weapon, onPointsCalculated, onClose }) {
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState(null);
  const [weaponStats, setWeaponStats] = useState({
    range: weapon.range || 0,
    attacks: String(weapon.attacks || '1'),
    ap: String(weapon.ap || '0'),
    type: weapon.type || 'Ranged',
  });

  const calculateCustomPoints = useCallback(() => {
    setError(null);
    
    // Calculate points based on weapon stats
    const range = weaponStats.range || 0;
    const attacks = parseAttacks(weaponStats.attacks);
    const ap = parseAP(weaponStats.ap);
    const isRanged = weaponStats.type === 'Ranged';
    
    // Base scoring system
    let rangeScore = 0;
    let attacksScore = 0;
    let apScore = 0;
    
    if (isRanged) {
      // Ranged weapon scoring - cap range at 48"
      const cappedRange = Math.min(range, 48);
      rangeScore = Math.min(cappedRange / 6, 8); // Max 8 points for 48" range
      attacksScore = Math.min(attacks * 2, 10); // Max 10 points for 5+ attacks
      apScore = Math.min(ap * 3, 15); // Max 15 points for 5+ AP
    } else {
      // Melee weapon scoring (range doesn't matter)
      attacksScore = Math.min(attacks * 3, 15); // Max 15 points for 5+ attacks
      apScore = Math.min(ap * 4, 20); // Max 20 points for 5+ AP
    }
    
    const totalScore = rangeScore + attacksScore + apScore;
    const basePoints = Math.max(1, Math.round(totalScore));
    
    setCalculatedPoints(basePoints);
    setBreakdown({
      range: {
        value: range,
        score: rangeScore.toFixed(1),
        weight: isRanged ? 0.4 : 0.1,
        weighted: (rangeScore * (isRanged ? 0.4 : 0.1)).toFixed(1)
      },
      attacks: {
        value: weaponStats.attacks,
        score: attacksScore.toFixed(1),
        weight: isRanged ? 0.4 : 0.6,
        weighted: (attacksScore * (isRanged ? 0.4 : 0.6)).toFixed(1)
      },
      ap: {
        value: weaponStats.ap,
        score: apScore.toFixed(1),
        weight: isRanged ? 0.2 : 0.3,
        weighted: (apScore * (isRanged ? 0.2 : 0.3)).toFixed(1)
      },
      combinedScore: totalScore,
      calculatedPoints: basePoints,
      weaponType: weaponStats.type
    });
    setExplanation(`Calculation: Range=${rangeScore.toFixed(1)} (${range}"), Attacks=${attacksScore.toFixed(1)} (${weaponStats.attacks}), AP=${apScore.toFixed(1)} (${weaponStats.ap}), Type=${weaponStats.type}`);
  }, [weaponStats]);

  // Auto-calculate on component mount and when stats change
  useEffect(() => {
    calculateCustomPoints();
  }, [weaponStats]); // Remove calculateCustomPoints dependency to prevent infinite re-renders

  const parseAttacks = (attacks) => {
    if (attacks === 'X' || attacks === 'x') return 3; // Assume X means 3 attacks
    const parsed = parseInt(attacks);
    return isNaN(parsed) ? 1 : Math.max(1, parsed);
  };

  const parseAP = (ap) => {
    const parsed = parseInt(ap);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  const handleInputChange = (field, value) => {
    setWeaponStats(prev => ({
      ...prev,
      [field]: field === 'attacks' ? String(value) : value
    }));
  };

  const handleApplyPoints = () => {
    if (onPointsCalculated) {
      onPointsCalculated(calculatedPoints);
    }
  };

  const getPointsColor = (points) => {
    if (points <= 5) return '#4CAF50'; // Green for very cheap
    if (points <= 15) return '#8BC34A'; // Light green for cheap
    if (points <= 25) return '#FF9800'; // Orange for moderate
    if (points <= 40) return '#FF5722'; // Red for expensive
    return '#9C27B0'; // Purple for very expensive (40-50)
  };

  return (
    <div className="weapon-points-calculator-overlay">
      <div className="weapon-points-calculator-modal">
        <div className="weapon-points-calculator-header">
          <h3>⚔️ Weapon Points Calculator</h3>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>

        <div className="weapon-points-calculator-content">
          <div className="weapon-info">
            <h4>{weapon.name || 'New Weapon'}</h4>
            <p><strong>Type:</strong> {weapon.type || 'Ranged'}</p>
            <p><strong>Current Points:</strong> {weapon.points || 0}</p>
          </div>

          <div className="weapon-stats">
            <h4>Weapon Statistics</h4>
            <div className="stats-grid">
              <div className="stat-group">
                <label>Range</label>
                <input
                  type="number"
                  value={weaponStats.range}
                  onChange={(e) => handleInputChange('range', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
              <div className="stat-group">
                <label>Attacks</label>
                <input
                  type="text"
                  value={weaponStats.attacks}
                  onChange={(e) => handleInputChange('attacks', e.target.value)}
                  placeholder="e.g., 1, 2, 3, X"
                />
              </div>
              <div className="stat-group">
                <label>AP</label>
                <input
                  type="text"
                  value={weaponStats.ap}
                  onChange={(e) => handleInputChange('ap', e.target.value)}
                  placeholder="e.g., 0, 1, 2, 3"
                />
              </div>
              <div className="stat-group">
                <label>Type</label>
                <select
                  value={weaponStats.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="Ranged">Ranged</option>
                  <option value="Melee">Melee</option>
                </select>
              </div>
            </div>
          </div>


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="calculated-points">
            <h4>Calculated Base Points (Range: 1-50)</h4>
            <div className="points-display">
              <div 
                className="points-value"
                style={{ backgroundColor: getPointsColor(calculatedPoints) }}
              >
                {calculatedPoints}
              </div>
              <div className="points-label">Base Points</div>
            </div>
          </div>

          {breakdown && breakdown.range && breakdown.attacks && breakdown.ap && (
            <div className="points-breakdown">
              <h4>Calculation Breakdown</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span className="label">Range:</span>
                  <span className="value">{breakdown.range?.value || '0'}" (Score: {breakdown.range?.score || '0.0'})</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Attacks:</span>
                  <span className="value">{breakdown.attacks?.value || '1'} (Score: {breakdown.attacks?.score || '0.0'})</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">AP:</span>
                  <span className="value">{breakdown.ap?.value || '0'} (Score: {breakdown.ap?.score || '0.0'})</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Weapon Type:</span>
                  <span className="value">{breakdown.weaponType || 'Ranged'}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Combined Score:</span>
                  <span className="value">{typeof breakdown.combinedScore === 'number' ? breakdown.combinedScore.toFixed(2) : '0.0'}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Base Points:</span>
                  <span className="value">{breakdown.calculatedPoints || calculatedPoints}</span>
                </div>
              </div>
            </div>
          )}

          {explanation && (
            <div className="points-explanation">
              <h4>Explanation</h4>
              <pre className="explanation-text">{explanation}</pre>
            </div>
          )}

          <div className="points-actions">
            <button onClick={handleApplyPoints} className="apply-button">
              Apply These Points
            </button>
            {onClose && (
              <button onClick={onClose} className="cancel-button">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .weapon-points-calculator-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .weapon-points-calculator-modal {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          color: #e6edf3;
        }

        .weapon-points-calculator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #30363d;
        }

        .weapon-points-calculator-header h3 {
          margin: 0;
          color: #f0f6fc;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #8b949e;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-button:hover {
          color: #f0f6fc;
          background-color: #21262d;
        }

        .weapon-points-calculator-content {
          padding: 1.5rem;
        }

        .weapon-info {
          background: #0d1117;
          border: 1px solid #30363d;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .weapon-info h4 {
          margin: 0 0 0.5rem 0;
          color: #f0f6fc;
          font-weight: 600;
        }

        .weapon-info p {
          margin: 0.25rem 0;
          color: #8b949e;
          font-size: 0.9rem;
        }



        .weapon-stats {
          background: #0d1117;
          border: 1px solid #30363d;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .weapon-stats h4 {
          margin: 0 0 1rem 0;
          color: #f0f6fc;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat-group {
          display: flex;
          flex-direction: column;
        }

        .stat-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #f0f6fc;
          font-size: 0.9rem;
        }

        .stat-group input,
        .stat-group select {
          padding: 0.75rem;
          border: 1px solid #30363d;
          border-radius: 6px;
          background-color: #0d1117;
          color: #e6edf3;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .stat-group input:focus,
        .stat-group select:focus {
          outline: none;
          border-color: #1f6feb;
          box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
        }

        .calculate-button {
          background: #1f6feb;
          color: white;
          border: 1px solid #1f6feb;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .calculate-button:hover {
          background: #2f81f3;
          border-color: #2f81f3;
        }

        .calculate-button:disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
        }

        .points-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .points-value {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.5rem;
        }

        .points-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #f0f6fc;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
        }

        .breakdown-item .label {
          font-weight: 600;
          color: #f0f6fc;
        }

        .breakdown-item .value {
          color: #e6edf3;
        }

        .explanation-text {
          background: #0d1117;
          border: 1px solid #30363d;
          padding: 1rem;
          border-radius: 6px;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 0.9rem;
          color: #e6edf3;
        }

        .points-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #30363d;
        }

        .apply-button {
          background: #238636;
          color: white;
          border: 1px solid #238636;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .apply-button:hover {
          background: #2ea043;
          border-color: #2ea043;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: 1px solid #6c757d;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .cancel-button:hover {
          background: #8b949e;
          border-color: #8b949e;
        }

        .error-message {
          background: #490202;
          color: #f85149;
          padding: 0.75rem;
          border-radius: 6px;
          margin: 1rem 0;
          border: 1px solid #da3633;
        }

        .calculated-points h4,
        .points-breakdown h4,
        .points-explanation h4 {
          color: #f0f6fc;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }
      `}</style>
    </div>
  );
}

export default WeaponPointsCalculator;