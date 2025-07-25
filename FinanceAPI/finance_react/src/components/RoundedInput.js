import React from 'react';
import { inputTheme } from './inputTheme';
import './RoundedInput.css';
import { getTextWidth, getInputWidth } from '../helpers/Helper';

export default function RoundedInput({ style = {}, placeholder = '', disabled = false, type = 'text', colFonts, colHeaders, allRows, colKey, i,...props }) {
  const className = 'roundedInput' + (disabled ? ' roundedInput--disabled' : '');
  const font = (style.fontSize ? `${style.fontSize}px` : '16px') + ' Arial';

  console.log(`props.placeholder?.toString(): ${placeholder?.toString()} RoundedInput props:`, { style, placeholder, disabled, type, colFonts, colHeaders, allRows, colKey, i });

  let placeholderWidth = getTextWidth(placeholder?.toString(), font);
  let inputwidth = getInputWidth(colFonts, colHeaders, allRows, colKey, i);
  
  let finalWidth = Math.max(inputwidth, placeholderWidth);

  // Increase width by 10 pixels for date inputs
  if (type === 'date') {
    let tooltipWidth = getTextWidth('mm/dd/yyyy', font);
    if (placeholderWidth > tooltipWidth && placeholderWidth > inputwidth) {
      finalWidth = placeholderWidth + 35;
    } else {
      finalWidth = Math.max(finalWidth, tooltipWidth);
    }
  }
  else{
    if(placeholderWidth > inputwidth) {
      finalWidth +=  40; // Adding 10px for padding
    }
    else {
    // For other input types, just ensure the width is at least the placeholder width
     finalWidth += 30 // Adding 100px for padding
    }
  }
 
  //console.log(`Type: ${type}, Placeholder: ${placeholder} -> ${getTextWidth(placeholder.toString(), font)}, Tooltip: 'mm/dd/yyyy' -> : ${getTextWidth('mm/dd/yyyy', font)} Value: ${props.value}->${getTextWidth(props.value.toString(), font)},  Final width: ${finalWidth}`);
  
  return (
    <input
      type={type}
      className={className}
      style={{ ...inputTheme, ...style, width: finalWidth }}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
}
