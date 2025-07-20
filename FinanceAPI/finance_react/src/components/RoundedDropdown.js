import React, { useState, useLayoutEffect, useRef } from 'react';
import { inputTheme } from './inputTheme';
import { DropdownPortal } from './DropdownPortal';
import { DROPDOWN_MIN_WIDTH } from '../constants/ui';
import './RoundedDropdown.css';
import { getTextWidth } from '../helpers/Helper';

function RoundedDropdown({ options = [], value, onChange, style = {}, placeholder = '', customWidth = 40, ...props }) {
  const [showList, setShowList] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [maxWidth, setMaxWidth] = useState(200);
  const [inputValue, setInputValue] = useState(value == null ? '' : String(value));
  const wrapperRef = useRef(null);
  const displayRef = useRef(null);

  const font = (style.fontSize ? `${style.fontSize}px` : '16px') + ' Arial';
  useLayoutEffect(() => {
    const widths = options.map(opt => getTextWidth((opt.label ?? opt).toString(), font));
    const widest = Math.max(80, ...widths) + 0; // 70px for arrow and padding
    setMaxWidth(widest);
  }, [options, font]);
  const width = style.width || maxWidth;

  const mergedStyle = { ...inputTheme, ...style };

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!showList) return;
    const handleClickOutside = (e) => {
      const dropdownList = document.querySelector('.roundedDropdown-list');
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        !(dropdownList && dropdownList.contains(e.target))
      ) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true); // Use capture phase

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

  const paddingBuffer = 12 + 12;   // left + right padding in item
  const arrowBuffer = 20;          // space for dropdown arrow
  const longestOptionWidth = Math.max(...options.map(opt =>
    getTextWidth((opt.label ?? opt).toString(), font)
  ));

const finalWidth =  Math.max(customWidth, longestOptionWidth + paddingBuffer + arrowBuffer)+ 15;


  const handleSelect = val => {
    setInputValue(val);
    if (onChange) onChange({ target: { value: val } });
    setShowList(false);
  };

  return (
    <div
      className="roundedDropdown custom"
      ref={wrapperRef}
      style={{ ...mergedStyle, width: finalWidth, position: 'relative' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="roundedDropdown-display"
        ref={displayRef}
        onClick={() => setShowList(v => !v)}
        style={{ minWidth: finalWidth, maxWidth: finalWidth, width: finalWidth, cursor: 'pointer', height: inputTheme.height }}
      >
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
    <div className="roundedDropdown-list" style={{ width: finalWidth, cursor: 'pointer'}}>
    <div className="roundedDropdown-scrollable">
      <ul style={{ margin: 0, padding: 0 }}>
        {options.map((opt, idx) => (
          <li
            key={opt.value ?? opt}
            className={'roundedDropdown-item' + (idx === highlightedIdx ? ' highlighted' : '')}
            onMouseDown={() => handleSelect(opt.value ?? opt)}
            onMouseEnter={() => setHighlightedIdx(idx)}
            style={{
              borderRadius: 20,
              whiteSpace: 'nowrap',
              height: 25,
              display: 'flex',
              alignItems: 'center',
              margin: '2px 0',
              padding: '4px 12px'
            }}
            title={opt.label ?? opt}
          >
            {opt.label ?? opt}
          </li>
        ))}
      </ul>
    </div>
  </div>
</DropdownPortal>

      )}
    </div>
  );
}

export default RoundedDropdown;
