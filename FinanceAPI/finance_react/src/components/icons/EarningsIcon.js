import React from 'react';
import earningsPng from './earnings.png';

function EarningsIcon({ size = 40, color }) {
  return (
    <img src={earningsPng} alt="Earnings" style={{ width: size, height: size }} />
  );
}

export default EarningsIcon;
