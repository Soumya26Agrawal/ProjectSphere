import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <section className="hero">
          <div className="hero__content">
            <h1 className="hero__title">Manage Pods. Build Spheres.</h1>
            <p className="hero__subtitle">
              PodManagement ProjectSphere helps teams stay aligned with focused execution, clear ownership, and a clean workflow.
            </p>
            <div className="hero__actions">
              <Button onClick={() => navigate('/login')} variant="primary">
                Get Started
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};