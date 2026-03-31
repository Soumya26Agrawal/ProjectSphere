import React from 'react';
import { ArrowRight } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import MockWorkspaceCard from '../components/MockWorkspaceCard';

export default function LandingView({ navigateTo }) {
  return (
    <div className="landing-page">
      <div className="blur-bg-1" />
      <div className="blur-bg-2" />

      <nav className="navbar">
        <BrandLogo clickable onClick={() => navigateTo('landing')} />
        <button className="btn-secondary" onClick={() => navigateTo('login')}>
          Log In
        </button>
      </nav>

      <main className="hero">
        <div className="hero-text">
          <h1 className="hero-title">
            Manage projects with <br />
            <span className="text-blue">absolute clarity.</span>
          </h1>
          <p className="hero-desc">
            ProjectSphere brings your team&apos;s work, goals, and communication together in one beautifully simple space. No clutter, just progress.
          </p>
          <button className="btn-primary hero-cta" onClick={() => navigateTo('login')}>
            Go to Workspace
            <ArrowRight />
          </button>
        </div>

        <div className="hero-visual">
          <MockWorkspaceCard />
        </div>
      </main>
    </div>
  );
}
