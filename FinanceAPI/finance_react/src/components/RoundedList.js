import React from 'react';
import { gridTheme } from './gridTheme';

// A simple rounded list component
function RoundedList({ items = [], style = {}, itemStyle = {}, ...props }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        borderRadius: 12,
        background: gridTheme.roundedInputTheme.background,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        ...style
      }}
      {...props}
    >
      {items.map((item, idx) => (
        <li
          key={idx}
          style={{
            padding: '8px 16px',
            borderBottom: idx < items.length - 1 ? '1px solid #eee' : 'none',
            borderRadius: 8,
            ...itemStyle
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default RoundedList;
