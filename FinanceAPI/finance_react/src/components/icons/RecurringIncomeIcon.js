import React from 'react';
import recurringPng from './Recurring.png';
import incomePng from './income.png';
// Simple recurring income icon: stacked coins with a repeat arrow
function RecurringIncomeIcon({ size = 40, color = '#1976d2', label = true }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: size }}>
      <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
        <img
          src={incomePng}
          alt="Income"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            objectFit: 'contain',
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            zIndex: 1,
            filter: color ? `drop-shadow(0 0 0 ${color})` : undefined,
          }}
        />
        <img
          src={recurringPng}
          alt="Recurring"
          style={{
            width: size * 0.65,
            height: size * 0.65,
            objectFit: 'contain',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            filter: color ? `drop-shadow(0 0 0 ${color})` : undefined,
          }}
        />
      </span>
    </span>
  );
}

export default RecurringIncomeIcon;
