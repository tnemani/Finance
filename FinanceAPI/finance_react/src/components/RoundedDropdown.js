import React, { useState, useLayoutEffect, useRef } from 'react';
import { gridTheme } from './gridTheme';
import './RoundedDropdown.css';
import { DropdownPortal } from './DropdownPortal';

function getTextWidth(text, font = '16px Arial') {
  if (typeof document === 'undefined') return 200;
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

function RoundedDropdown({ options = [], value, onChange, style = {}, placeholder = '', ...props }) {
  const [showList, setShowList] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [maxWidth, setMaxWidth] = useState(200);
  const [inputValue, setInputValue] = useState(value == null ? '' : String(value));
  const wrapperRef = useRef(null);
  const displayRef = useRef(null);

  const font = (style.fontSize ? `${style.fontSize}px` : '16px') + ' Arial';
  useLayoutEffect(() => {
    const widths = options.map(opt => getTextWidth((opt.label ?? opt).toString(), font));
    const widest = Math.max(80, ...widths) + 70; // 70px for arrow and padding
    setMaxWidth(widest);
  }, [options, font]);
  const width = style.width || maxWidth;

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!showList) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showList]);

  // Keyboard navigation
  const handleKeyDown = e => {
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(idx => Math.min(options.length - 1, idx + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(idx => Math.max(0, idx - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIdx >= 0 && highlightedIdx < options.length) {
        handleSelect(options[highlightedIdx].value ?? options[highlightedIdx]);
      }
    }
  };

  // Keep inputValue in sync with value prop
  React.useEffect(() => {
    setInputValue(value == null ? '' : String(value));
  }, [value]);

  // Reset highlight when options or dropdown changes
  React.useEffect(() => {
    if (showList) setHighlightedIdx(options.findIndex(opt => (opt.value ?? opt) === value));
    else setHighlightedIdx(-1);
  }, [showList, options, value]);

  const handleSelect = val => {
    setInputValue(val);
    if (onChange) onChange({ target: { value: val } });
    setShowList(false);
  };

  return (
    <div
      className="roundedDropdown custom"
      ref={wrapperRef}
      style={{ width, minWidth: 140, maxWidth, ...style }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="roundedDropdown-display"
        ref={displayRef}
        onClick={() => setShowList(v => !v)}
        style={{ minWidth: 140, maxWidth, width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 35 }}
      >
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 16 }}>
          {options.find(opt => (opt.value ?? opt) === value)?.label ?? options.find(opt => (opt.value ?? opt) === value) ?? placeholder}
        </span>
        <span className="roundedDropdown-arrow" style={{ marginRight: 16, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L14 8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {showList && options.length > 0 && (
        <DropdownPortal anchorRef={displayRef}>
          <ul className="roundedDropdown-list" style={{ minWidth: displayRef.current ? displayRef.current.offsetWidth : 140, maxWidth }}>
            {options.map((opt, idx) => (
              <li
                key={opt.value ?? opt}
                className={
                  'roundedDropdown-item' + (idx === highlightedIdx ? ' highlighted' : '')
                }
                onMouseDown={() => handleSelect(opt.value ?? opt)}
                onMouseEnter={() => setHighlightedIdx(idx)}
                style={{ borderRadius: 20 }}
              >
                {opt.label ?? opt}
              </li>
            ))}
          </ul>
        </DropdownPortal>
      )}
    </div>
  );
}

export default RoundedDropdown;
