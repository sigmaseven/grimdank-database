import React, { useState, useEffect, useCallback } from 'react';

function PointsCalculator({ rule, onPointsCalculated, onClose }) {
  const [calculatedPoints, setCalculatedPoints] = useState([0, 0, 0]);
  const [breakdown, setBreakdown] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customEffectiveness, setCustomEffectiveness] = useState({
    baseValue: 'moderate',
    multiplier: 1.0,
    frequency: 'conditional'
  });
  const [useCustom, setUseCustom] = useState(false);

  const calculatePoints = useCallback(async () => {
    if (!rule) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/points/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: rule.name,
          description: rule.description,
          type: rule.type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate points');
      }

      const data = await response.json();
      setCalculatedPoints(data.calculated_points);
      setBreakdown(data.breakdown);
      setExplanation(data.explanation);
    } catch (err) {
      setError('Failed to calculate points: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [rule]);

  useEffect(() => {
    if (rule) {
      calculatePoints();
    }
  }, [rule, calculatePoints]);

  const calculateCustomPoints = () => {
    // Calculate points based on custom effectiveness
    const baseWeight = getBaseEffectivenessWeight(customEffectiveness.baseValue);
    
    const combinedScore = baseWeight;
    const finalScore = combinedScore * customEffectiveness.multiplier;
    
    // Apply frequency multiplier
    const frequencyMultiplier = getFrequencyMultiplier(customEffectiveness.frequency);
    const adjustedScore = finalScore * frequencyMultiplier;
    
    // Calculate base points using logarithmic scaling
    const basePoints = Math.pow(2, (adjustedScore - 1) / 2);
    const clampedPoints = Math.max(1, Math.min(75, basePoints));
    
    let tier1 = Math.round(clampedPoints);
    let tier2 = Math.round(clampedPoints * 1.1);
    let tier3 = Math.round(clampedPoints * 1.21);
    
    // Ensure each tier has a unique cost (minimum 1 point difference)
    if (tier2 <= tier1) {
      tier2 = tier1 + 1;
    }
    if (tier3 <= tier2) {
      tier3 = tier2 + 1;
    }
    
    // Ensure tiers don't exceed the maximum (75 points)
    if (tier1 > 75) tier1 = 75;
    if (tier2 > 75) tier2 = 75;
    if (tier3 > 75) tier3 = 75;
    
    setCalculatedPoints([tier1, tier2, tier3]);
  };

  const handleApplyPoints = () => {
    if (onPointsCalculated) {
      onPointsCalculated(calculatedPoints);
    }
  };

  const handleCustomChange = (field, value) => {
    setCustomEffectiveness(prev => ({
      ...prev,
      [field]: field === 'frequency' ? value : (parseFloat(value) || 0)
    }));
  };

  const getFrequencyMultiplier = (frequency) => {
    switch (frequency) {
      case 'passive': return 1.0;   // Full cost - always active
      case 'conditional': return 0.7; // 30% discount - triggered by conditions
      case 'limited': return 0.4;   // 60% discount - limited uses
      default: return 0.7;
    }
  };

  const getBaseEffectivenessWeight = (baseValue) => {
    switch (baseValue) {
      case 'minimal': return 1.0;       // Minimal effectiveness - weak rules
      case 'moderate': return 3.0;      // Moderate effectiveness - decent rules
      case 'strong': return 5.0;        // Strong effectiveness - powerful rules
      case 'overpowered': return 8.0;   // Overpowered effectiveness - game-breaking rules
      default: return 3.0;
    }
  };


  const getPointsColor = (points) => {
    if (points <= 3) return '#4CAF50'; // Green for very cheap
    if (points <= 10) return '#8BC34A'; // Light green for cheap
    if (points <= 25) return '#FF9800'; // Orange for moderate
    if (points <= 50) return '#FF5722'; // Red for expensive
    return '#9C27B0'; // Purple for very expensive (50-75)
  };

  const getTierDescription = (tier) => {
    const descriptions = [
      'Basic - Minimal impact (1-25 pts)',
      'Enhanced - Moderate advantage (26-50 pts)',
      'Advanced - Elite capability (51-75 pts)'
    ];
    return descriptions[tier] || '';
  };

  const getUniqueTierNote = () => {
    return 'Each tier has a unique cost (minimum 1 point difference)';
  };

  return (
    <div className="points-calculator-overlay">
      <div className="points-calculator-modal">
        <div className="points-calculator-header">
          <h3>🧮 Rule Points Calculator</h3>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>

        <div className="points-calculator-content">
          {rule && (
            <div className="rule-info">
              <h4>{rule.name}</h4>
              <p><strong>Type:</strong> {rule.type}</p>
              <p><strong>Description:</strong> {rule.description}</p>
            </div>
          )}

          <div className="calculation-modes">
            <div className="mode-selector">
              <label>
                <input
                  type="radio"
                  name="calculationMode"
                  checked={!useCustom}
                  onChange={() => setUseCustom(false)}
                />
                Automatic Analysis
              </label>
              <label>
                <input
                  type="radio"
                  name="calculationMode"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                />
                Custom Values
              </label>
            </div>
          </div>

          {useCustom && (
            <div className="custom-effectiveness">
              <h4>Custom Effectiveness Values</h4>
              <div className="effectiveness-inputs">
                <div className="input-group">
                  <label>Base Effectiveness</label>
                  <select
                    value={customEffectiveness.baseValue}
                    onChange={(e) => handleCustomChange('baseValue', e.target.value)}
                  >
                    <option value="minimal">Minimal (Weak Rules)</option>
                    <option value="moderate">Moderate (Decent Rules)</option>
                    <option value="strong">Strong (Powerful Rules)</option>
                    <option value="overpowered">Overpowered (Game-Breaking Rules)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Multiplier (0.1-2.0)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={customEffectiveness.multiplier}
                    onChange={(e) => handleCustomChange('multiplier', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Frequency</label>
                  <select
                    value={customEffectiveness.frequency}
                    onChange={(e) => handleCustomChange('frequency', e.target.value)}
                  >
                    <option value="passive">Passive (Always Active)</option>
                    <option value="conditional">Conditional (Triggered)</option>
                    <option value="limited">Limited (Restricted Use)</option>
                  </select>
                </div>
              </div>
              <button onClick={calculateCustomPoints} className="calculate-button">
                Calculate Custom Points
              </button>
            </div>
          )}

          {!useCustom && (
            <div className="calculation-controls">
              <button onClick={calculatePoints} disabled={loading} className="calculate-button">
                {loading ? 'Calculating...' : 'Recalculate Points'}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="calculated-points">
            <h4>Calculated Points (Range: 1-75 per model)</h4>
            <p style={{ fontSize: '0.9em', color: '#8b949e', marginBottom: '1rem' }}>
              {getUniqueTierNote()}
            </p>
            <div className="points-display">
              {calculatedPoints.map((points, index) => (
                <div key={index} className="tier-points">
                  <div 
                    className="points-value"
                    style={{ backgroundColor: getPointsColor(points) }}
                  >
                    {points}
                  </div>
                  <div className="tier-info">
                    <div className="tier-label">Tier {index + 1}</div>
                    <div className="tier-description">{getTierDescription(index)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {breakdown && (
            <div className="points-breakdown">
              <h4>Calculation Breakdown</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span className="label">Base Effectiveness:</span>
                  <span className="value">{breakdown.effectiveness?.base_value}/10</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Multiplier:</span>
                  <span className="value">{breakdown.effectiveness?.multiplier}x</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Frequency:</span>
                  <span className="value">{breakdown.effectiveness?.frequency}</span>
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
        .points-calculator-overlay {
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

        .points-calculator-modal {
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

        .points-calculator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #30363d;
        }

        .points-calculator-header h3 {
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

        .points-calculator-content {
          padding: 1.5rem;
        }

        .rule-info {
          background: #0d1117;
          border: 1px solid #30363d;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .rule-info h4 {
          margin: 0 0 0.5rem 0;
          color: #f0f6fc;
          font-weight: 600;
        }

        .rule-info p {
          margin: 0.25rem 0;
          color: #8b949e;
          font-size: 0.9rem;
        }

        .mode-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .mode-selector label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #e6edf3;
          font-size: 0.9rem;
        }

        .mode-selector input[type="radio"] {
          margin-right: 0.5rem;
        }

        .effectiveness-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #f0f6fc;
          font-size: 0.9rem;
        }

        .input-group input {
          padding: 0.75rem;
          border: 1px solid #30363d;
          border-radius: 6px;
          background-color: #0d1117;
          color: #e6edf3;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
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
          gap: 1rem;
          margin: 1rem 0;
        }

        .tier-points {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .points-value {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .tier-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #f0f6fc;
        }

        .tier-description {
          font-size: 0.8rem;
          color: #8b949e;
          text-align: center;
          max-width: 120px;
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

export default PointsCalculator;
