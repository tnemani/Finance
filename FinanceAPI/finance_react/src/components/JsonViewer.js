import React, { useState } from 'react';

function JsonViewer({ data }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (value, keyPrefix = '') => {
    if (Array.isArray(value)) {
      return (
        <div style={{ marginLeft: 16 }}>
          [
          {value.map((item, idx) => (
            <div key={idx}>{renderValue(item, keyPrefix + idx + '_')}</div>
          ))}
          ]
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div style={{ marginLeft: 16 }}>
          {'{'}
          {Object.entries(value).map(([k, v]) => (
            <div key={k}>
              <span style={{ cursor: 'pointer', color: '#0074d9' }} onClick={() => toggle(keyPrefix + k)}>
                {typeof v === 'object' && v !== null ? (expanded[keyPrefix + k] ? '▼' : '▶') : ''} {k}:
              </span>
              {typeof v === 'object' && v !== null ? (
                expanded[keyPrefix + k] ? renderValue(v, keyPrefix + k + '_') : null
              ) : (
                <span> {JSON.stringify(v)}</span>
              )}
            </div>
          ))}
          {'}'}
        </div>
      );
    } else {
      return <span>{JSON.stringify(value)}</span>;
    }
  };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 14, background: '#f8f8f8', padding: 16, borderRadius: 8 }}>
      {renderValue(data)}
    </div>
  );
}

export default JsonViewer;
