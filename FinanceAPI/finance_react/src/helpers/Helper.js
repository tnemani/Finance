import { currencyOptions } from '../constants/Fixedlist';

export function getTextWidth(text, font = '16px Arial') {
  if (typeof document === 'undefined') return 200;
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}

export function getInputWidth(colFonts, colHeaders, allRows, colKey, i) {
  // Defensive checks
  if (
    !Array.isArray(colFonts) ||
    !Array.isArray(colHeaders) ||
    !Array.isArray(allRows) ||
    typeof i !== 'number' ||
    i < 0 ||
    i >= colFonts.length ||
    i >= colHeaders.length ||
    !colKey
  ) {
    return 20; // fallback width
  }
  const font = colFonts[i] || '16px Arial';
  const headerWidth = getTextWidth(colHeaders[i] || '', font);
  const cellWidths = allRows.map(row =>
    getTextWidth((row && row[colKey]) ? String(row[colKey]) : '', font)
  );
  const placeholderWidth = getTextWidth(colHeaders[i] || '', font);
  return Math.max(headerWidth, ...cellWidths, placeholderWidth) + 24; // 24px for padding/buffer
}

 export function formatDateMDY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  
    // Helper to format date as 'Month Day Year'
   export function formatMonthDayYear(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date)) return dateStr;
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day} ${year}`;
    }
  
    // Helper to format phone numbers
    export function formatPhoneNumber(number) {
      if (!number) return '';
      // Remove non-digits except leading country code
      const digits = number.replace(/[^\d]/g, '');
      if (digits.startsWith('001')) {
        // US: (001) 425-123-4567
        if (digits.length >= 13) {
          return `(001) ${digits.slice(3,6)}-${digits.slice(6,9)}-${digits.slice(9,13)}`;
        }
        if (digits.length === 11) {
          return `(001) ${digits.slice(3,6)}-${digits.slice(6,8)}-${digits.slice(8,11)}`;
        }
        if (digits.length === 10) {
          return `(001) ${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
        }
        return number;
      }
      if (digits.startsWith('011')) {
        // India: (011) 91-9440543132
        if (digits.length >= 14) {
          return `(011) 91-${digits.slice(5,15)}`;
        }
        if (digits.length >= 12) {
          return `(011) 91-${digits.slice(5,12)}`;
        }
        return `(011) 91-${digits.slice(5)}`;
      }
      return number;
    }

    export function formatCurrencyValue(value, currency) {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    if (currency === 'USD') {
      // US format with $ symbol prefix, no cents
      return '$  ' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    if (currency === 'INR') {
      // Indian format with ₹ symbol prefix, no decimals
      const [intPart] = num.toFixed(0).split('.');
      let lastThree = intPart.slice(-3);
      let otherNumbers = intPart.slice(0, -3);
      if (otherNumbers !== '') lastThree = ',' + lastThree;
      return '₹  ' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    }
    return num;
  };

  // Helper function to get currency display label
  export function getCurrencyDisplayLabel(currencyCode) {
    if (!currencyCode) return '';
    const option = currencyOptions.find(opt => opt.value === currencyCode);
    return option ? option.label : currencyCode;
  }
