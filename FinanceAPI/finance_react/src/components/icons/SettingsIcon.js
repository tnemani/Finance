import React from 'react';
import settingsPng from './settings.png';

function SettingsIcon({ size = 40, color }) {
  return (
    <img src={settingsPng} alt="Settings" style={{ width: size, height: size, filter: color ? `invert(34%) sepia(92%) saturate(747%) hue-rotate(183deg) brightness(92%) contrast(92%)` : undefined }} />
  );
}

export default SettingsIcon;
