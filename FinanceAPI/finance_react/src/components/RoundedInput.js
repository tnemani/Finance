import React from 'react';
import { inputTheme } from './inputTheme';
import './RoundedInput.css';
import { getTextWidth, getInputWidth } from '../helpers/Helper';

export default function RoundedInput({ style = {}, placeholder = '', disabled = false, type = 'text', colFonts, colHeaders, allRows, colKey, i,...props }) {
  const className = 'roundedInput' + (disabled ? ' roundedInput--disabled' : '');
  const font = (style.fontSize ? `${style.fontSize}px` : '16px') + ' Arial';
  //console.log('RoundedInput style:', style);
  console.log('RoundedInput type:', type );
  let finalWidth = Math.max(placeholder ? getTextWidth(placeholder.toString(), font) : 0, getInputWidth(colFonts, colHeaders, allRows, colKey, i));
  
  // Increase width by 10 pixels for date inputs
  if (type === 'date') {
    finalWidth += 50;
  }
  else{
    //finalWidth += 5;
  }
  
  console.log('RoundedInput style final width:', finalWidth );
  return (
    <input
      type={type}
      className={className}
      style={{ ...inputTheme, ...style, width: finalWidth }}
      disabled={disabled}
      {...props}
    />
  );
}
