import React from 'react';

function Home() {
  return (
    <div className="card">
      <h2>Welcome to Grimdank Database</h2>
      <p>Your comprehensive wargame administration system for managing:</p>
      <ul>
        <li><strong>Units</strong> - Game units with stats, rules, and equipment</li>
        <li><strong>Weapons</strong> - Weapons with range, strength, and special abilities</li>
        <li><strong>WarGear</strong> - Equipment and gear with embedded rules and weapons</li>
        <li><strong>Rules</strong> - Special rules and abilities</li>
        <li><strong>Army Books</strong> - Faction-specific collections of units and rules</li>
        <li><strong>Army Lists</strong> - Player army compositions</li>
      </ul>
      <p>Use the navigation menu above to manage your wargame data.</p>
    </div>
  );
}

export default Home;
