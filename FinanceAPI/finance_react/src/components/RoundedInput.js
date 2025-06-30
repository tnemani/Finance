import React from 'react';
import { gridTheme } from './gridTheme';

export default function RoundedInput({ style = {}, disabled = false, ...props }) {
  const mergedStyle = disabled
    ? { ...gridTheme.roundedInputThemeDisabled, ...style }
    : { ...gridTheme.roundedInputTheme, ...style };
  return (
    <input
      type="text"
      style={mergedStyle}
      disabled={disabled}
      {...props}
    />
  );
}
