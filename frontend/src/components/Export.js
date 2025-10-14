import React, { useState } from 'react';
import { rulesAPI, weaponsAPI, wargearAPI, unitsAPI, armyBooksAPI, armyListsAPI } from '../services/api';
import { Icon } from './Icons';

function Export() {
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const entityTypes = [
    { value: 'rules', label: 'Rules', icon: 'rules' },
    { value: 'weapons', label: 'Weapons', icon: 'weapons' },
    { value: 'wargear', label: 'WarGear', icon: 'wargear' },
    { value: 'units', label: 'Units', icon: 'units' },
    { value: 'armybooks', label: 'Army Books', icon: 'armybooks' },
    { value: 'armylists', label: 'Army Lists', icon: 'armylists' }
  ];

  const handleExport = async () => {
    if (!selectedType) {
      setError('Please select an entity type first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let data;
      switch (selectedType) {
        case 'rules':
          data = await rulesAPI.getAll();
          break;
        case 'weapons':
          data = await weaponsAPI.getAll();
          break;
        case 'wargear':
          data = await wargearAPI.getAll();
          break;
        case 'units':
          data = await unitsAPI.getAll();
          break;
        case 'armybooks':
          data = await armyBooksAPI.getAll();
          break;
        case 'armylists':
          data = await armyListsAPI.getAll();
          break;
        default:
          throw new Error('Invalid entity type');
      }

      const entitiesArray = Array.isArray(data) ? data : [];
      const jsonString = JSON.stringify(entitiesArray, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Successfully exported ${entitiesArray.length} ${selectedType} entities`);
    } catch (err) {
      setError(`Failed to export ${selectedType}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Export Entities</h2>
        <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
          Export all entities of a selected type as a JSON file. The exported file can be imported back into the system.
        </p>

        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success" style={{ marginBottom: '1rem' }}>
            <strong>✅ {success}</strong>
          </div>
        )}

        <div className="form-group">
          <label>Entity Type *</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ marginBottom: '1rem' }}
          >
            <option value="">Select entity type...</option>
            {entityTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            className="btn btn-success"
            onClick={handleExport}
            disabled={!selectedType || loading}
          >
            <Icon name="download" size={16} color="#ffffff" style={{ marginRight: '0.5rem' }} />
            {loading ? 'Exporting...' : 'Export All Entities'}
          </button>
        </div>

        {selectedType && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#161b22', 
            borderRadius: '6px', 
            border: '1px solid #30363d' 
          }}>
            <h4 style={{ color: '#f0f6fc', margin: '0 0 0.5rem 0' }}>
              Exporting: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </h4>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '0.9rem' }}>
              This will export all {selectedType} entities in your database as a JSON file.
              The file will be named: <code>{selectedType}_export_{new Date().toISOString().split('T')[0]}.json</code>
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Export Instructions</h3>
        <div style={{ color: '#8b949e' }}>
          <h4>How to Export:</h4>
          <ol>
            <li>Select the entity type you want to export</li>
            <li>Click "Export All Entities" to download the JSON file</li>
            <li>The exported file contains all entities of that type</li>
            <li>The exported file can be imported back into the system</li>
          </ol>

          <h4>Export Format:</h4>
          <p>The exported JSON file contains an array of all entity objects in the same format used by the import feature:</p>
          <pre style={{ 
            background: '#161b22', 
            padding: '1rem', 
            borderRadius: '6px',
            fontSize: '0.9rem',
            marginTop: '0.5rem'
          }}>
{`[
  {
    "id": "entity-id",
    "name": "Entity Name",
    "description": "Entity description...",
    // ... other entity fields
  }
]`}
          </pre>

          <h4>Important Notes:</h4>
          <ul>
            <li>Exports ALL entities of the selected type (no individual selection)</li>
            <li>Exported files include all entity data and relationships</li>
            <li>Files are named with the entity type and export date</li>
            <li>Exported JSON can be imported into other instances of the system</li>
            <li>Perfect for backing up entire entity collections</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Export;
