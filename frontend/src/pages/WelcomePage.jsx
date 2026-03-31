import React from 'react';
import { Navbar } from '../components/Navbar';
import { LayoutGrid, Users, Briefcase } from 'lucide-react';
import './WelcomePage.css';

export const WelcomePage = () => {
  return (
    <div className="welcome-page">
      <Navbar />
      <main className="welcome-main">
        <header className="welcome-header">
          <h1 className="welcome-title">Welcome to ProjectSphere</h1>
          <p className="welcome-subtitle">Select a module to begin managing your pods.</p>
        </header>
        
        <section className="modules-grid">
          <article className="module-card">
            <div className="module-icon-wrap">
              <Briefcase size={28} className="module-icon" />
            </div>
            <h2 className="module-title">Projects</h2>
            <p className="module-desc">Organize and track your active spheres.</p>
            <div className="module-action">Coming Soon</div>
          </article>
          
          <article className="module-card">
            <div className="module-icon-wrap">
              <Users size={28} className="module-icon" />
            </div>
            <h2 className="module-title">Team Pods</h2>
            <p className="module-desc">Manage squad alignments and resources.</p>
            <div className="module-action">Coming Soon</div>
          </article>
          
          <article className="module-card">
            <div className="module-icon-wrap">
              <LayoutGrid size={28} className="module-icon" />
            </div>
            <h2 className="module-title">Boards</h2>
            <p className="module-desc">Visualize sprints, tasks, and roadblocks.</p>
            <div className="module-action">Coming Soon</div>
          </article>
        </section>
      </main>
    </div>
  );
};
