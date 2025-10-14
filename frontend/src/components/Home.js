import React from 'react';

function Home() {
  return (
    <div className="card">
      <h2 style={{ color: '#f0f6fc', marginBottom: '1rem' }}>Welcome to Grimdank Database</h2>
      <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>Your comprehensive wargame administration system for managing:</p>
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚔️</span>
          <div>
            <strong style={{ color: '#f0f6fc' }}>Units</strong> - Game units with stats, rules, and equipment
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔫</span>
          <div>
            <strong style={{ color: '#f0f6fc' }}>Weapons</strong> - Weapons with range, strength, and special abilities
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
          <div>
            <strong style={{ color: '#f0f6fc' }}>WarGear</strong> - Equipment and gear with embedded rules and weapons
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📜</span>
          <div>
            <strong style={{ color: '#f0f6fc' }}>Rules</strong> - Special rules and abilities
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          <div>
            <strong style={{ color: '#f0f6fc' }}>Army Books</strong> - Faction-specific collections of units and rules
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          <div>
            <strong style={{ color: '#f0f6fc' }}>Army Lists</strong> - Player army compositions
          </div>
        </div>
      </div>
      <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Use the navigation menu on the left to manage your wargame data.</p>
    </div>
  );
}

export default Home;
