// Bangladeshi Currency (BDT) Formatter Utility
export const formatBDT = (amount: number): string => {
  if (isNaN(amount)) return '৳0';
  return '৳' + Math.round(amount).toLocaleString('en-BD');
};
