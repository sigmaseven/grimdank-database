import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Units from './components/Units';
import Weapons from './components/Weapons';
import WarGear from './components/WarGear';
import Rules from './components/Rules';
import ArmyBooks from './components/ArmyBooks';
import ArmyLists from './components/ArmyLists';
import Factions from './components/Factions';
import Import from './components/Import';
import Export from './components/Export';
import Home from './components/Home';
import PageTransition from './components/PageTransition';
import { Icon } from './components/Icons';

// Navigation component with icons
function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/units', label: 'Units', icon: 'units' },
    { path: '/weapons', label: 'Weapons', icon: 'weapons' },
    { path: '/wargear', label: 'WarGear', icon: 'wargear' },
    { path: '/rules', label: 'Rules', icon: 'rules' },
    { path: '/factions', label: 'Factions', icon: 'factions' },
    { path: '/armybooks', label: 'Army Books', icon: 'armybooks' },
    { path: '/armylists', label: 'Army Lists', icon: 'armylists' },
    { path: '/import', label: 'Import', icon: 'import' },
    { path: '/export', label: 'Export', icon: 'export' }
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
            <span className="nav-icon">
              <Icon 
                name={item.icon} 
                size={20} 
                color={location.pathname === item.path ? '#1f6feb' : '#8b949e'} 
              />
            </span>
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
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/units" element={<Units />} />
              <Route path="/weapons" element={<Weapons />} />
              <Route path="/wargear" element={<WarGear />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/factions" element={<Factions />} />
              <Route path="/armybooks" element={<ArmyBooks />} />
              <Route path="/armylists" element={<ArmyLists />} />
              <Route path="/import" element={<Import />} />
              <Route path="/export" element={<Export />} />
            </Routes>
          </PageTransition>
        </main>
      </div>
    </Router>
  );
}

export default App;
