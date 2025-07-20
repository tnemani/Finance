// Input theme for all inputs and dropdowns, with width set to 100% by default
export const inputTheme = {
  width: '100%',
  height: 40,
  fontSize: 16,
  padding: '0 16px',
  boxSizing: 'border-box',
  border: '1px solid #1976d2',
  borderRadius: 20,
  background: '#fff',
  transition: 'border 0.2s, box-shadow 0.2s',
  overflow: 'hidden',
  textAlign: 'left',
  color: '#222',
  outline: 'none',
  minWidth: 125,
  margin: 0,
  verticalAlign: 'middle',
  display: 'block',
};

// For special columns (like 'units'), override width in the page/component as needed:
// style={{ ...inputTheme, width: '80%', maxWidth: '80%' }}
