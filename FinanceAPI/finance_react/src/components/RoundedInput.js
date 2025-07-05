import React from 'react';
import { gridTheme } from './gridTheme';
import './RoundedInput.css';

export default function RoundedInput({ style = {}, disabled = false, type = 'text', ...props }) {
  // Use CSS class for consistent border curve and spin button removal
  const className = 'roundedInput' + (disabled ? ' roundedInput--disabled' : '');
  return (
    <input
      type={type}
      className={className}
      style={style}
      disabled={disabled}
      {...props}
    />
  );
}
