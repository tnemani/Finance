// Central currency options for all grids
export const currencyOptions = [
  { value: 'USD', label: '$ (USD)' },
  { value: 'INR', label: '₹ (INR)' },
  { value: 'EUR', label: '€ (EUR)' },
  { value: 'GBP', label: '£ (GBP)' },
  { value: 'JPY', label: '¥ (JPY)' },
  { value: 'CAD', label: 'C$ (CAD)' },
  { value: 'AUD', label: 'A$ (AUD)' },
  { value: 'SGD', label: 'S$ (SGD)' },
  { value: 'CNY', label: '¥ (CNY)' },
];

// Add-on options
const stockOption = { value: 'Stock', label: 'Stock' };

// Compose without duplicates
export const currencyOptionsWithStock = [
  ...currencyOptions,
  ...(currencyOptions.some(opt => opt.value === stockOption.value) ? [] : [stockOption]),
];

// Helper to get weight units for dropdowns
export function getWeightOptions() {
  return [
    { value: 'mg', label: 'Milligrams (mg)' },
    { value: 'gm', label: 'Grams (gm)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounce (oz)' },
    { value: 'oz t', label: 'Troy Ounce (oz t)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'ct', label: 'Carat (ct)' }
  ];
}

// Helper to get user group options for dropdowns
export function getUserGroupOptions() {
  return [
    { value: 'Family', label: 'Family' },
    { value: 'Nemani Family', label: 'Nemani Family' },
    { value: 'Dhavala Family', label: 'Dhavala Family' },
    { value: 'Sarma Relatives', label: 'Sarma Relatives' },
    { value: 'Mani Relatives', label: 'Mani Relatives' },
    { value: 'Trinadh Friends', label: 'Trinadh Friends' },
    { value: 'Sirisha Friends', label: 'Sirisha Friends' },
    { value: 'Manikanta Friends', label: 'Manikanta Friends' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Work', label: 'Work'}
  ];
}

export function getAddressTypeOptions() {
  return [
    { value: 'Apartment (Flat)', label: 'Apartment (Flat)' },
    { value: 'Business (Office)', label: 'Business' },
    { value: 'Garden', label: 'Garden' },
    { value: 'Home', label: 'Home' },
    { value: 'Plot (Site)', label: 'Plot (Site)' },
    { value: 'Work (Office)', label: 'Work (Office)' }
  ];
}

export function getEarningsTypeOptions() {
  return [
    { value: 'Salary', label: 'Salary' },
    { value: 'Bonus', label: 'Bonus' },
    { value: 'Stock', label: 'Stock' },
    { value: 'Rental', label: 'Rental' },
    { value: 'Exercise', label: 'Exercise' },
    { value: 'Other', label: 'Other' }
  ];
}

export function getFrequencyTypeOptions() {
  return [
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Bi-Weekly', label: 'Bi-Weekly' },
    { value: 'Semi Monthly', label: 'Semi Monthly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Yearly', label: 'Yearly' }
  ];
}