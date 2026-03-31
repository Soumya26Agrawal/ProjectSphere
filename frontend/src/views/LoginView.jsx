import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export default function LoginView({
  navigateTo,
  showPassword,
  setShowPassword,
  isLoading,
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
  loginError,
}) {
  return (
    <div className="login-page">
      <div className="blur-bg-1" style={{ top: '-20%', right: '-10%' }} />
      <div className="blur-bg-2" style={{ bottom: '-20%', left: '-10%' }} />

      <div className="login-card">
        <div className="back-link" onClick={() => navigateTo('landing')}>
          <ArrowLeft />
          Back to home
        </div>

        <BrandLogo />

        <div className="header-group">
          <h1 className="h1-title">Welcome back</h1>
          <p className="p-subtitle">Enter your details to access your workspace.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label" htmlFor="email">
              Email
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Mail />
              </div>
              <input
                id="email"
                type="email"
                placeholder="id@cognizant.com"
                className="input-field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-header">
              <label className="label" htmlFor="password">
                Password
              </label>
              <a
                href="#"
                className="forgot-link"
                onClick={(event) => {
                  event.preventDefault();
                }}
              >
                Forgot password?
              </a>
            </div>
            <div className="input-wrapper">
              <div className="input-icon">
                <Lock />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field input-with-action"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="input-action">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {loginError ? <p className="login-error">{loginError}</p> : null}

          <button type="submit" disabled={isLoading} className="btn-primary full-width">
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <>
                Sign in to workspace
                <ArrowRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
