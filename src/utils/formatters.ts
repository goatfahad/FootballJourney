/**
 * Formats a numeric value as currency (euros)
 */
export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '€0';
  
  const numAmount = parseFloat(String(amount));

  if (Math.abs(numAmount) >= 1e9) {
    return `€${(numAmount / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(numAmount) >= 1e6) {
    return `€${(numAmount / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(numAmount) >= 1e3) {
    return `€${(numAmount / 1e3).toFixed(1)}K`;
  }
  return `€${numAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};