import React from 'react';

function UnitsList({ units, onEdit, onDelete, onAttachRules, onAttachWeapons, onAttachWargear }) {
  return (
    <div className="units-list">
      <div className="table-responsive">
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
              <th>Amount</th>
              <th>Max</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map(unit => (
              <tr key={unit.id}>
                <td>{unit.name}</td>
                <td>{unit.type}</td>
                <td>{unit.melee}</td>
                <td>{unit.ranged}</td>
                <td>{unit.morale}</td>
                <td>{unit.defense}</td>
                <td>{unit.points}</td>
                <td>{unit.amount}</td>
                <td>{unit.max}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => onEdit(unit)}
                      className="btn btn-sm btn-primary"
                      title="Edit Unit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(unit.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete Unit"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => onAttachRules(unit)}
                      className="btn btn-sm btn-info"
                      title="Attach Rules"
                    >
                      Rules
                    </button>
                    <button 
                      onClick={() => onAttachWeapons(unit)}
                      className="btn btn-sm btn-warning"
                      title="Attach Weapons"
                    >
                      Weapons
                    </button>
                    <button 
                      onClick={() => onAttachWargear(unit)}
                      className="btn btn-sm btn-success"
                      title="Attach WarGear"
                    >
                      WarGear
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UnitsList;
