import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login logic
    if (email && password) {
      navigate('/welcome');
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <main className="login-main">
        <section className="login-card">
          <div className="login-header">
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Access your workspace.</p>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            <Input 
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="login-actions">
              <Button type="submit" variant="primary" fluid>
                Sign In
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};
