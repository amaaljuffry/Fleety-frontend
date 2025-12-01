/**
 * Format distance value based on unit preference
 * @param distance - The distance value in miles (original unit)
 * @param unit - The desired unit ('miles' or 'km')
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with unit
 */
export const formatDistance = (
  distance: number,
  unit: string = 'miles',
  decimals: number = 0
): string => {
  if (unit === 'km') {
    // Convert miles to kilometers (1 mile = 1.60934 km)
    const km = distance * 1.60934;
    const formatted = km.toFixed(decimals);
    return `${parseFloat(formatted).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} km`;
  }
  // Default to miles
  const formatted = distance.toFixed(decimals);
  return `${parseFloat(formatted).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} mi`;
};

/**
 * Get the distance unit label
 * @param unit - The unit ('miles' or 'km')
 * @returns Unit label (mi or km)
 */
export const getDistanceUnitLabel = (unit: string = 'miles'): string => {
  return unit === 'km' ? 'km' : 'mi';
};

/**
 * Convert distance from miles to the target unit
 * @param miles - Distance in miles
 * @param unit - Target unit ('miles' or 'km')
 * @returns Converted distance value (number only, without unit)
 */
export const convertDistance = (miles: number, unit: string = 'miles'): number => {
  if (unit === 'km') {
    return miles * 1.60934;
  }
  return miles;
};
