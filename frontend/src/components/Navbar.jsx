import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
import './Navbar.css';

export const Navbar = () => {
  const location = useLocation();
  const isWelcomePage = location.pathname === '/welcome';

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo-box">Ps</div>
          <span className="navbar__logo-text">
            <span className="logo-bold">Project</span>
            <span className="logo-thin">Sphere</span>
          </span>
        </Link>
        <div className="navbar__actions">
          {!isWelcomePage ? (
            <Link to="/login" className="navbar__link">
              <Button variant="primary">Log In</Button>
            </Link>
          ) : (
            <Link to="/login" className="navbar__link">
              <Button variant="secondary">Log Out</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};