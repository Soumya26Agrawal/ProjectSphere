import React, { useState } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import { loginUser } from './services/authService';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      const name = [result?.firstName, result?.lastName].filter(Boolean).join(' ').trim();
      const greetingName = name || result?.email || 'User';
      window.alert(`Successfully logged in as ${greetingName}`);
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return currentView === 'landing' ? (
    <LandingView navigateTo={navigateTo} />
  ) : (
    <LoginView
      navigateTo={navigateTo}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      isLoading={isLoading}
      handleLogin={handleLogin}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loginError={loginError}
    />
  );
}
