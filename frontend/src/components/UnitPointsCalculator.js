import React, { useState, useEffect, useCallback } from 'react';

function UnitPointsCalculator({ unit, onPointsCalculated, onClose }) {
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculatePoints = useCallback(async () => {
    if (!unit) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/calculate-unit-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit: unit
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate unit points');
      }

      const data = await response.json();
      setCalculatedPoints(data.total_points);
      setBreakdown(data.breakdown);
      
      // Call the callback with the calculated points
      if (onPointsCalculated) {
        onPointsCalculated(data.total_points);
      }
    } catch (err) {
      setError('Failed to calculate points: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [unit, onPointsCalculated]);

  useEffect(() => {
    if (unit) {
      calculatePoints();
    }
  }, [unit, calculatePoints]);

  const handleApplyPoints = () => {
    if (onPointsCalculated) {
      onPointsCalculated(calculatedPoints);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="unit-points-calculator-overlay">
      <div className="unit-points-calculator-modal">
        <div className="unit-points-calculator-header">
          <h3>🧮 Unit Points Calculator</h3>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>

        <div className="unit-points-calculator-content">
          {loading && (
            <div className="loading-message">
              Calculating unit points...
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="calculated-points">
            <h4>Total Unit Points</h4>
            <div className="total-points-display">
              <div className="total-points-value">
                {calculatedPoints}
              </div>
              <div className="total-points-label">Points</div>
            </div>
          </div>

          {breakdown && (
            <div className="points-breakdown">
              <h4>Cost Breakdown</h4>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="breakdown-label">Base Unit Cost:</span>
                  <span className="breakdown-value">{breakdown.base_cost} pts</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Unit Rules Cost:</span>
                  <span className="breakdown-value">{breakdown.unit_rules_cost} pts</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Weapons Cost:</span>
                  <span className="breakdown-value">{breakdown.weapons_cost} pts</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Weapon Rules Cost:</span>
                  <span className="breakdown-value">{breakdown.weapon_rules_cost} pts</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Wargear Cost:</span>
                  <span className="breakdown-value">{breakdown.wargear_cost} pts</span>
                </div>
                <div className="breakdown-item total-item">
                  <span className="breakdown-label"><strong>Total:</strong></span>
                  <span className="breakdown-value"><strong>{breakdown.total_points} pts</strong></span>
                </div>
              </div>
            </div>
          )}

          <div className="unit-details">
            <h4>Unit Details</h4>
            <div className="unit-stats">
              <div className="stat-item">
                <span className="stat-label">Melee:</span>
                <span className="stat-value">{unit?.melee || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ranged:</span>
                <span className="stat-value">{unit?.ranged || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Morale:</span>
                <span className="stat-value">{unit?.morale || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Defense:</span>
                <span className="stat-value">{unit?.defense || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Models:</span>
                <span className="stat-value">{unit?.amount || 0}</span>
              </div>
            </div>
          </div>

          <div className="unit-actions">
            <button onClick={calculatePoints} disabled={loading} className="recalculate-button">
              {loading ? 'Calculating...' : 'Recalculate Points'}
            </button>
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

        <style jsx>{`
          .unit-points-calculator-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999 !important;
          }

          .unit-points-calculator-modal {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
          }

          .unit-points-calculator-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #30363d;
          }

          .unit-points-calculator-header h3 {
            margin: 0;
            color: #f0f6fc;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .close-button {
            background: none;
            border: none;
            color: #8b949e;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
          }

          .close-button:hover {
            background: #30363d;
            color: #f0f6fc;
          }

          .unit-points-calculator-content {
            padding: 1.5rem;
          }

          .loading-message {
            text-align: center;
            color: #58a6ff;
            padding: 2rem;
            font-style: italic;
          }

          .error-message {
            background: #da3633;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
            border: 1px solid #da3633;
          }

          .calculated-points h4,
          .points-breakdown h4,
          .unit-details h4 {
            color: #f0f6fc;
            font-weight: 600;
            margin: 0 0 1rem 0;
          }

          .total-points-display {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin: 1rem 0;
          }

          .total-points-value {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #238636, #2ea043);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
            box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3);
          }

          .total-points-label {
            font-size: 1.2rem;
            color: #f0f6fc;
            font-weight: 600;
          }

          .breakdown-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .breakdown-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
          }

          .breakdown-item.total-item {
            background: #0d1117;
            border: 2px solid #238636;
          }

          .breakdown-label {
            color: #e6edf3;
          }

          .breakdown-value {
            color: #f0f6fc;
            font-weight: 600;
          }

          .unit-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
          }

          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
          }

          .stat-label {
            color: #8b949e;
            font-size: 0.9rem;
          }

          .stat-value {
            color: #f0f6fc;
            font-weight: 600;
          }

          .unit-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
          }

          .recalculate-button,
          .apply-button,
          .cancel-button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9rem;
          }

          .recalculate-button {
            background: #238636;
            color: white;
          }

          .recalculate-button:hover:not(:disabled) {
            background: #2ea043;
          }

          .apply-button {
            background: #58a6ff;
            color: white;
          }

          .apply-button:hover {
            background: #388bfd;
          }

          .cancel-button {
            background: #6c757d;
            color: white;
          }

          .cancel-button:hover {
            background: #5a6268;
          }

          .recalculate-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  );
}

export default UnitPointsCalculator;

