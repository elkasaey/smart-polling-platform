import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <h1>🗳️ Smart Polling</h1>
        </Link>
        <div className="navbar-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/create" 
            className={`nav-link ${isActive('/create') ? 'active' : ''}`}
          >
            Create Poll
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
