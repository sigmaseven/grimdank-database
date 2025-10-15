import React, { useState } from 'react';
import { rulesAPI, weaponsAPI, wargearAPI, unitsAPI, armyBooksAPI, armyListsAPI } from '../services/api';
import { Icon } from './Icons';

function Import() {
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [template, setTemplate] = useState(null);

  const entityTypes = [
    { value: 'rules', label: 'Rules', icon: 'rules' },
    { value: 'weapons', label: 'Weapons', icon: 'weapons' },
    { value: 'wargear', label: 'WarGear', icon: 'wargear' },
    { value: 'units', label: 'Units', icon: 'units' },
    { value: 'armybooks', label: 'Army Books', icon: 'armybooks' },
    { value: 'armylists', label: 'Army Lists', icon: 'armylists' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid JSON file');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedType) {
      setError('Please select both a file and entity type');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of entities');
      }

      let response;
      switch (selectedType) {
        case 'rules':
          response = await rulesAPI.import(data);
          break;
        case 'weapons':
          response = await weaponsAPI.import(data);
          break;
        case 'wargear':
          response = await wargearAPI.import(data);
          break;
        case 'units':
          response = await unitsAPI.import(data);
          break;
        case 'armybooks':
          response = await armyBooksAPI.import(data);
          break;
        case 'armylists':
          response = await armyListsAPI.import(data);
          break;
        default:
          throw new Error('Invalid entity type');
      }

      setResult({
        message: response.message,
        count: response.count,
        importedIds: response.imported_ids || response.importedIds
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.response?.data 
        || err.message 
        || 'Import failed';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedType) {
      setError('Please select an entity type first');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/import/template/${selectedType}`);
      const templateData = await response.json();
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handlePreviewTemplate = async () => {
    if (!selectedType) {
      setError('Please select an entity type first');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/v1/import/template/${selectedType}`);
      const templateData = await response.json();
      setTemplate(templateData);
    } catch (err) {
      setError('Failed to load template');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Import Entities</h2>
        <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
          Import multiple entities from JSON files. Upload a JSON file containing an array of entity objects.
        </p>

        {error && <div className="error">{error}</div>}
        {result && (
          <div className="success" style={{ marginBottom: '1rem' }}>
            <strong>✅ {result.message}</strong>
            <p>Imported {result.count} entities</p>
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

        <div className="form-group">
          <label>JSON File *</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ marginBottom: '1rem' }}
          />
          <small style={{ color: '#8b949e' }}>
            Select a JSON file containing an array of {selectedType || 'entity'} objects
          </small>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            className="btn btn-success"
            onClick={handleImport}
            disabled={!file || !selectedType || loading}
          >
            {loading ? 'Importing...' : 'Import Entities'}
          </button>

          <button
            className="btn"
            onClick={handleDownloadTemplate}
            disabled={!selectedType}
          >
            <Icon name="import" size={16} color="#8b949e" style={{ marginRight: '0.5rem' }} />
            Download Template
          </button>

          <button
            className="btn"
            onClick={handlePreviewTemplate}
            disabled={!selectedType}
          >
            <Icon name="preview" size={16} color="#8b949e" style={{ marginRight: '0.5rem' }} />
            Preview Template
          </button>
        </div>
      </div>

      {template && (
        <div className="card">
          <h3>Template Preview</h3>
          <p style={{ color: '#8b949e', marginBottom: '1rem' }}>
            This is the structure your JSON file should follow:
          </p>
          <pre style={{ 
            background: '#161b22', 
            padding: '1rem', 
            borderRadius: '6px', 
            overflow: 'auto',
            fontSize: '0.9rem',
            color: '#e6edf3'
          }}>
            {JSON.stringify(template, null, 2)}
          </pre>
          <button
            className="btn"
            onClick={() => setTemplate(null)}
            style={{ marginTop: '1rem' }}
          >
            Close Preview
          </button>
        </div>
      )}

      <div className="card">
        <h3>Import Instructions</h3>
        <div style={{ color: '#8b949e' }}>
          <h4>How to Import:</h4>
          <ol>
            <li>Select the entity type you want to import</li>
            <li>Download the template to see the expected JSON structure</li>
            <li>Create your JSON file following the template format</li>
            <li>Upload your JSON file and click "Import Entities"</li>
          </ol>

          <h4>JSON Format:</h4>
          <p>Your JSON file should be an array of objects, for example:</p>
          <pre style={{ 
            background: '#161b22', 
            padding: '1rem', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
{`[
  {
    "name": "Entity Name",
    "description": "Description...",
    // ... other fields
  },
  {
    "name": "Another Entity",
    "description": "Another description...",
    // ... other fields
  }
]`}
          </pre>

          <h4>Important Notes:</h4>
          <ul>
            <li>All entities must have a <code>name</code> field</li>
            <li>Nested objects (like rules, weapons) should be included as full objects</li>
            <li>Empty arrays are allowed for optional fields</li>
            <li>IDs will be automatically generated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Import;
