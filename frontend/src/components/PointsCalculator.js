import React, { useState, useEffect, useCallback } from 'react';

function PointsCalculator({ rule, onPointsCalculated, onClose }) {
  const [calculatedPoints, setCalculatedPoints] = useState([0, 0, 0]);
  const [breakdown, setBreakdown] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customEffectiveness, setCustomEffectiveness] = useState({
    baseValue: 3,
    multiplier: 1.0,
    complexity: 2,
    gameImpact: 2
  });
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    if (rule) {
      calculatePoints();
    }
  }, [rule, calculatePoints]);

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

  const calculateCustomPoints = () => {
    // Calculate points based on custom effectiveness
    const baseEffectiveness = customEffectiveness.baseValue;
    const complexityBonus = customEffectiveness.complexity * 0.2;
    const impactBonus = customEffectiveness.gameImpact * 0.3;
    
    const combinedScore = baseEffectiveness + complexityBonus + impactBonus;
    const finalScore = combinedScore * customEffectiveness.multiplier;
    
    // Calculate base points using logarithmic scaling
    const basePoints = Math.pow(2, (finalScore - 1) / 2);
    const clampedPoints = Math.max(2, Math.min(150, basePoints));
    
    const tier1 = Math.round(clampedPoints);
    const tier2 = Math.round(clampedPoints * 1.1);
    const tier3 = Math.round(clampedPoints * 1.21);
    
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
      [field]: parseFloat(value) || 0
    }));
  };

  const getPointsColor = (points) => {
    if (points <= 5) return '#4CAF50'; // Green for cheap
    if (points <= 15) return '#FF9800'; // Orange for moderate
    if (points <= 50) return '#FF5722'; // Red for expensive
    return '#9C27B0'; // Purple for very expensive
  };

  const getTierDescription = (tier) => {
    const descriptions = [
      'Basic - Minimal impact on gameplay',
      'Enhanced - Noticeable tactical advantage',
      'Advanced - Significant strategic benefit'
    ];
    return descriptions[tier] || '';
  };

  return (
    <div className="points-calculator-overlay">
      <div className="points-calculator-modal">
        <div className="points-calculator-header">
          <h3>Points Calculator</h3>
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
                  <label>Base Effectiveness (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customEffectiveness.baseValue}
                    onChange={(e) => handleCustomChange('baseValue', e.target.value)}
                  />
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
                  <label>Complexity (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={customEffectiveness.complexity}
                    onChange={(e) => handleCustomChange('complexity', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Game Impact (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={customEffectiveness.gameImpact}
                    onChange={(e) => handleCustomChange('gameImpact', e.target.value)}
                  />
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
            <h4>Calculated Points</h4>
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
                  <span className="label">Complexity:</span>
                  <span className="value">{breakdown.effectiveness?.complexity}/5</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Game Impact:</span>
                  <span className="value">{breakdown.effectiveness?.game_impact}/5</span>
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
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .points-calculator-modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .points-calculator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .points-calculator-content {
          padding: 1rem;
        }

        .rule-info {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
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
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .input-group input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .calculate-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .calculate-button:disabled {
          background: #ccc;
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
          font-weight: bold;
          font-size: 0.9rem;
        }

        .tier-description {
          font-size: 0.8rem;
          color: #666;
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
          padding: 0.5rem;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .breakdown-item .label {
          font-weight: bold;
        }

        .explanation-text {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .points-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .apply-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 0.5rem;
          border-radius: 4px;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}

export default PointsCalculator;
