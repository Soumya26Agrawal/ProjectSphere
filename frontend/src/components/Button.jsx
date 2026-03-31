import React from 'react';
import './Button.css';

export const Button = ({ children, variant = 'primary', fluid = false, onClick, type = 'button' }) => {
  return (
    <button
      className={`btn btn--${variant} ${fluid ? 'btn--fluid' : ''}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
