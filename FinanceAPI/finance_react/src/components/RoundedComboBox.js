import React, { useState, useLayoutEffect } from 'react';
import { gridTheme } from './gridTheme';
import './RoundedComboBox.css';

function getTextWidth(text, font = '16px Arial') {
  if (typeof document === 'undefined') return 200;
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

function RoundedComboBox({ options = [], value, onChange, style = {}, inputStyle = {}, placeholder = '', ...props }) {
  // Always store inputValue as a string
  const [inputValue, setInputValue] = useState(value == null ? '' : String(value));
  const [showList, setShowList] = useState(false);
  const [maxWidth, setMaxWidth] = useState(200);
  const [isHovered, setIsHovered] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const comboRef = React.useRef(null);

  useLayoutEffect(() => {
    const font = (style.fontSize ? `${style.fontSize}px` : '16px') + ' Arial';
    const widths = options.map(opt => getTextWidth((opt.label ?? opt).toString(), font));
    const widest = Math.max(100, ...widths) + 70; // 70px for icon/padding
    setMaxWidth(widest);
  }, [options, style.fontSize]);

  // Keep inputValue in sync with value prop
  React.useEffect(() => {
    setInputValue(value == null ? '' : String(value));
  }, [value]);

  // Always use string for filtering
  const filterStr = String(inputValue).toLowerCase();
  const filteredOptions = options.filter(opt =>
    (opt.label ?? opt).toString().toLowerCase().includes(filterStr)
  );

  // Reset highlight when options or dropdown changes
  React.useEffect(() => {
    if (showList) setHighlightedIdx(filteredOptions.length > 0 ? 0 : -1);
    else setHighlightedIdx(-1);
  }, [showList, filterStr, filteredOptions.length]);

  React.useEffect(() => {
    if (!showList) return;
    const handleClickOutside = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showList]);

  const handleInputChange = e => {
    const val = e.target.value == null ? '' : String(e.target.value);
    setInputValue(val);
    if (onChange) onChange(e);
    // Do not open dropdown on input change
  };

  const handleArrowClick = e => {
    e.stopPropagation();
    setShowList(v => !v);
  };

  const handleSelect = val => {
    const strVal = val == null ? '' : String(val);
    setInputValue(strVal);
    if (onChange) onChange({ target: { value: strVal } });
    setShowList(false);
  };

  // Keyboard navigation
  const handleInputKeyDown = e => {
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(idx => Math.min(filteredOptions.length - 1, idx + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(idx => Math.max(0, idx - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIdx >= 0 && highlightedIdx < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIdx].value ?? filteredOptions[highlightedIdx]);
      }
    }
  };

  return (
    <div
      ref={comboRef}
      className="rounded-combobox-wrapper"
      style={{ width: style.width || maxWidth, minWidth: 140, maxWidth, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={() => setTimeout(() => setShowList(false), 150)}
        placeholder={placeholder}
        className="rounded-combobox-input"
        style={{ width: '100%', minWidth: 140, maxWidth, ...inputStyle }}
        {...props}
      />
      {/* Down arrow icon, always show */}
      <span
        className="rounded-combobox-arrow"
        onMouseDown={handleArrowClick}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8L10 12L14 8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {showList && filteredOptions.length > 0 && (
        <ul className="rounded-combobox-list" style={{ maxWidth }}>
          {filteredOptions.filter(opt => (opt.label ?? opt).toString().toLowerCase() !== 'select' && (opt.value ?? opt).toString().toLowerCase() !== 'select').map((opt, idx) => (
            <li
              key={opt.value ?? opt}
              className={
                'rounded-combobox-item' + (idx === highlightedIdx ? ' highlighted' : '')
              }
              onMouseDown={() => handleSelect(opt.value ?? opt)}
              onMouseEnter={() => setHighlightedIdx(idx)}
            >
              {opt.label ?? opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoundedComboBox;
