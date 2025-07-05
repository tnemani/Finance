import React from 'react';

// Common GridBanner with full-width, left-aligned style
export default function GridBanner({ icon, title, searchText, setSearchText, placeholder = 'Search...', children, style = {}, titleStyle = {}, iconStyle = {} }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      textAlign: 'left',
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: '0 40px 0 32px', // more right/left padding
      boxSizing: 'border-box',
      background: '#e3f0fc',
      borderRadius: 10,
      boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)',
      minHeight: 44,
      position: 'relative',
      ...style
    }}>
      <h2 style={{
        display: 'flex', alignItems: 'center',
        textAlign: 'left', fontSize: 32, fontWeight: 800, marginBottom: 8, marginTop: 0, letterSpacing: 1, background: 'none', borderRadius: 8, padding: '10px 0', color: '#1976d2', boxShadow: 'none', flex: 1, zIndex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', justifyContent: 'flex-start',
        ...titleStyle
      }}>
        {icon && <img src={icon} alt={title} style={{ height: 54, width: 54, marginRight: 18, verticalAlign: 'middle', display: 'inline-block', ...iconStyle }} />}
        {title}
      </h2>
      <div style={{ marginLeft: 24, minWidth: 260, display: 'flex', alignItems: 'center', position: 'absolute', right: 24, height: 48, background: 'none', zIndex: 1 }}>
        <div style={{ position: 'relative', width: 260, height: 40, display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={placeholder}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setSearchText(e.target.value); }}
            style={{ width: 260, height: 40, border: '1px solid #1976d2', borderRadius: 8, padding: '0 40px 0 12px', fontSize: 18, outline: 'none', background: 'rgba(255,255,255,0.7)', boxShadow: 'none' }}
          />
          <button
            onClick={() => setSearchText(searchText)}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }}
            title="Search"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="#1976d2" strokeWidth="2" fill="none" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
