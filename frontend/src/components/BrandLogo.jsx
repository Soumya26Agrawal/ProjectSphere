import React from 'react';

export default function BrandLogo({ clickable = false, onClick }) {
  return (
    <div
      className={`logo-wrapper${clickable ? ' clickable' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="logo-box">Ps.</div>
      <span className="logo-text">
        <span className="logo-project">Project</span>
        <span className="logo-sphere">Sphere</span>
      </span>
    </div>
  );
}
