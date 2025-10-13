import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Units from './components/Units';
import Weapons from './components/Weapons';
import WarGear from './components/WarGear';
import Rules from './components/Rules';
import ArmyBooks from './components/ArmyBooks';
import ArmyLists from './components/ArmyLists';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <div className="container">
            <h1>Grimdank Database</h1>
            <nav className="nav">
              <Link to="/">Home</Link>
              <Link to="/units">Units</Link>
              <Link to="/weapons">Weapons</Link>
              <Link to="/wargear">WarGear</Link>
              <Link to="/rules">Rules</Link>
              <Link to="/armybooks">Army Books</Link>
              <Link to="/armylists">Army Lists</Link>
            </nav>
          </div>
        </header>
        
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/units" element={<Units />} />
            <Route path="/weapons" element={<Weapons />} />
            <Route path="/wargear" element={<WarGear />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/armybooks" element={<ArmyBooks />} />
            <Route path="/armylists" element={<ArmyLists />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
