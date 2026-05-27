import React from 'react';
import './Input.css';

export default function Input({ icon, label, id, ...props }) {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && (
          <div className="input-icon">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`input-field ${icon ? 'has-icon' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
}
