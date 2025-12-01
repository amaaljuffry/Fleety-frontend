// Currency formatter utility
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  RM: 'RM',
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCurrencySymbol = (currency: string = 'USD'): string => {
  return currencySymbols[currency] || '$';
};
