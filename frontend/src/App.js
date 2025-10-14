import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Units from './components/Units';
import Weapons from './components/Weapons';
import WarGear from './components/WarGear';
import Rules from './components/Rules';
import ArmyBooks from './components/ArmyBooks';
import ArmyLists from './components/ArmyLists';
import Import from './components/Import';
import Home from './components/Home';

// Navigation component with icons
function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/units', label: 'Units', icon: '⚔️' },
    { path: '/weapons', label: 'Weapons', icon: '🔫' },
    { path: '/wargear', label: 'WarGear', icon: '🛡️' },
    { path: '/rules', label: 'Rules', icon: '📜' },
    { path: '/armybooks', label: 'Army Books', icon: '📚' },
    { path: '/armylists', label: 'Army Lists', icon: '📋' },
    { path: '/import', label: 'Import', icon: '📥' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Grimdank DB</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/units" element={<Units />} />
            <Route path="/weapons" element={<Weapons />} />
            <Route path="/wargear" element={<WarGear />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/armybooks" element={<ArmyBooks />} />
            <Route path="/armylists" element={<ArmyLists />} />
            <Route path="/import" element={<Import />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
