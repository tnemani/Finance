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
  //return Math.max(headerWidth, ...cellWidths, placeholderWidth); // 24px for padding/buffer
  return Math.max(...cellWidths, 0);
}


  
    // Helper to format date as 'Month Day Year'
   export function formatMonthDayYear(dateStr) {
      if (!dateStr) return '';
      
      // Handle different date formats
      let date;
      if (dateStr.includes('T')) {
        // Already has time component, use as-is
        date = new Date(dateStr);
      } else {
        // Date only, add time component to avoid timezone issues
        date = new Date(dateStr + 'T00:00:00');
      }
      
      if (isNaN(date)) return dateStr;
      
      // Use UTC methods to avoid timezone conversion issues
      const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const day = date.getUTCDate();
      const year = date.getUTCFullYear();
      return `${month} ${day}, ${year}`;
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

  // Helper function to format value with unit-specific prefix/suffix
  export function formatValueWithUnit(value, units) {
    if (value == null || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return value;
    
    // Format the number with Indian format
    const [intPart, decPart] = num.toFixed(2).split('.');
    let lastThree = intPart.slice(-3);
    let otherNumbers = intPart.slice(0, -3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    const finalValue = decPart === '00' ? formatted : formatted + '.' + decPart;
    
    if (!units) return finalValue;
    
    // Handle currency units (prefix with symbols)
    if (units === 'USD') {
      return `$ ${finalValue}`;
    }
    if (units === 'INR') {
      return `₹ ${finalValue}`;
    }
    if (units === 'EUR') {
      return `€ ${finalValue}`;
    }
    if (units === 'GBP') {
      return `£ ${finalValue}`;
    }
    if (units === 'JPY') {
      return `¥ ${finalValue}`;
    }
    if (units === 'CAD') {
      return `C$ ${finalValue}`;
    }
    if (units === 'AUD') {
      return `A$ ${finalValue}`;
    }
    if (units === 'SGD') {
      return `S$ ${finalValue}`;
    }
    if (units === 'CNY') {
      return `¥ ${finalValue}`;
    }
    
    // Handle percentage (suffix, no space)
    if (units === 'Percentage') {
      return `${finalValue}%`;
    }
    
    // Handle weight units (suffix with space)
    if (units === 'Milligrams (mg)') {
      return `${finalValue} mg`;
    }
    if (units === 'Grams (gm)') {
      return `${finalValue} gms`;
    }
    if (units === 'Kilograms (kg)') {
      return `${finalValue} kg`;
    }
    if (units === 'Ounce (oz)') {
      return `${finalValue} oz`;
    }
    if (units === 'Troy Ounce (oz t)') {
      return `${finalValue} oz t`;
    }
    if (units === 'Pounds (lb)') {
      return `${finalValue} lb`;
    }
    if (units === 'Carat (ct)') {
      return `${finalValue} ct`;
    }
    
    // Handle time units (suffix with space)
    if (units === 'hr(s)') {
      return `${finalValue} hrs`;
    }
    if (units === 'day(s)') {
      return `${finalValue} days`;
    }
    if (units === 'month(s)') {
      return `${finalValue} months`;
    }
    if (units === 'year(s)') {
      return `${finalValue} years`;
    }
    
    // Handle miscellaneous units
    if (units === 'Piece(s)') {
      return `${finalValue} pieces`;
    }
    
    // Default: append unit as suffix
    return `${finalValue} ${units}`;
  }

  export function getColWidth(key, header, allRows) {
      const headerWidth = getTextWidth(header, '16px Arial');
      const cellWidths = allRows.map(row => getTextWidth((row && row[key]) ? String(row[key]) : '', '16px Arial'));
      return Math.max(headerWidth, ...cellWidths, 80) + 40;
  }

  // Helper to format date for HTML date input fields (YYYY-MM-DD format)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};