import React from 'react';

// SVG icons for edit and delete
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-2.12.71.71-2.12 9.3-9.3zM3 17h14v2H3v-2z" fill="#1976d2"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round"/>
    <rect x="3" y="4" width="14" height="2" rx="1" fill="#d32f2f"/>
    <rect x="8" y="2" width="4" height="2" rx="1" fill="#d32f2f"/>
  </svg>
);

function JsonGridView({ data, onEdit, onDelete, hideId }) {
  if (!data || typeof data !== 'object') return <div>No data</div>;

  // Helper to convert PascalCase or camelCase to 'Pascal Case'
  function toSpacedCase(str) {
    if (str === 'FirstName') return 'First$Name';
    // Replace underscores with spaces first
    let spaced = str.replace(/_/g, ' ');
    // Insert space before any uppercase letter that follows a lowercase letter or digit
    spaced = spaced.replace(/([a-z\d])([A-Z])/g, '$1 $2');
    // Insert space between two uppercase letters followed by a lowercase letter (e.g., XMLParser -> XML Parser)
    spaced = spaced.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    // Capitalize the first letter and lowercase the rest for each word
    return spaced.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }

  // If data is an array of objects, show as table
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    let columns = Array.from(
      data.reduce((cols, row) => {
        Object.keys(row).forEach((k) => cols.add(k));
        return cols;
      }, new Set())
    );
    if (hideId) {
      columns = columns.filter(col => col.toLowerCase() !== 'id');
    }
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ border: '1px solid #ccc', padding: 4, background: '#f5f5f5' }}>{toSpacedCase(col)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col} style={{ border: '1px solid #ccc', padding: 4, overflow: 'hidden', verticalAlign: 'middle' }}>
                  {row._editing && row._editing[col] !== undefined ? (
                    <input
                      type="text"
                      value={row._editing[col]}
                      onChange={e => row._onEditChange(col, e.target.value)}
                      style={{
                        width: '100%',
                        border: '1px solid #1976d2',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        outline: 'none',
                        fontSize: '1em',
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                        transition: 'border 0.2s',
                        minWidth: 0,
                        background: 'yellow', // DEBUG: should be visible if style is picked up
                        margin: 0,
                        boxSizing: 'border-box',
                        display: 'block',
                        lineHeight: 1.5,
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    />
                  ) : (
                    typeof row[col] === 'object' && row[col] !== null
                      ? JSON.stringify(row[col])
                      : String(row[col] ?? '')
                  )}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: '50%',
                        transition: 'background 0.2s',
                        marginRight: 4
                      }}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: '50%',
                        transition: 'background 0.2s',
                        marginLeft: 4
                      }}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // If data is a single object, show as key-value grid
  if (!Array.isArray(data)) {
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td style={{ border: '1px solid #ccc', padding: 4, fontWeight: 'bold', background: '#f5f5f5' }}>{toSpacedCase(key)}</td>
              <td style={{ border: '1px solid #ccc', padding: 4 }}>
                {typeof value === 'object' && value !== null
                  ? JSON.stringify(value)
                  : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Fallback for other types
  return <div>{String(data)}</div>;
}

export default JsonGridView;
