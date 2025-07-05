// Shared grid theme for all tables
export const gridTheme = {
  table: {
    borderCollapse: 'separate', // Fix: allow borderRadius to show
    borderSpacing: 0,           // Remove spacing between cells
    width: '100%',
    background: '#f9fbfd',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)',
    fontFamily: 'inherit',
    fontSize: 16,
  },
  th: {
    border: '1px solid #b6c6e3',
    padding: 8,
    background: '#e3f0fc',
    fontWeight: 700,
    fontSize: 16,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    color: '#1976d2',
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  td: {
    border: '1px solid #dde6f7',
    padding: 8,
    background: '#fff',
    verticalAlign: 'middle',
    fontSize: 15,
    color: '#222',
    minHeight: 36,
    height: 44, // Add explicit height for consistency
    boxSizing: 'border-box',
  },
  tr: {
    height: 44,
    lineHeight: '44px',
    // Ensures consistent row height across all grids
  },
  scrollContainer: {
    maxHeight: 4 * 44 + 2,
    overflowY: 'auto',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)',
    background: '#f9fbfd',
    border: '1px solid #dde6f7', // Add border for visible rounded corners
  },
  roundedInputTheme: {
    border: '1px solid #dde6f7', // subtle border for add mode
    borderRadius: 8,
    padding: '4px 8px',
    fontSize: '1em',
    background: '#f9fbfd',
    minHeight: 28,
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
  },
  roundedInputThemeDisabled: {
    border: '1px solid #dde6f7', // subtle border for add mode
    borderRadius: 8,
    padding: '4px 8px',
    fontSize: '1em',
    background: '#f3f6fa',
    minHeight: 28,
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    color: '#aaa',
    cursor: 'not-allowed',
  },
  roundedSelectTheme: {
    border: 'none',
    borderRadius: 8,
    padding: '4px 8px',
    fontSize: '1em',
    background: '#f9fbfd',
    minHeight: 28,
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
  },
  editableDropdownTheme: {
    border: '1.5px solidrgb(210, 25, 71)',
    borderRadius: 8,
    padding: '4px 8px',
    fontSize: '1em',
    background: '#f9fbfd',
    minHeight: 28,
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
  },
};

// Central currency options for all grids
export const currencyOptions = [
  { value: '$', label: '$ (USD)' },
  { value: 'Rs', label: '₹ (INR)' },
  { value: '€', label: '€ (EUR)' },
  { value: '£', label: '£ (GBP)' },
  { value: '¥', label: '¥ (JPY)' },
  { value: 'CAD', label: 'C$ (CAD)' },
  { value: 'AUD', label: 'A$ (AUD)' },
  { value: 'SGD', label: 'S$ (SGD)' },
  { value: 'CNY', label: '¥ (CNY)' },
  { value: 'Stock', label: 'Stock' },
  // Add more as needed
];
