import React from 'react';
import cashPng from './cash.png';

function CashIcon({ size = 48, color }) {
  // Render the cash icon without a circular background for menu consistency
  return (
    <img
      src={cashPng}
      alt="Cash"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: color ? `drop-shadow(0 0 0 ${color})` : undefined,
      }}
    />
  );
}

export default CashIcon;
