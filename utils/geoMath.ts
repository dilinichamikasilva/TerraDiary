/**
 * Calculates the bearing (compass direction) from point A to point B.
 * Returns value in degrees (0-360).
 */
export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const rad = Math.PI / 180;
  const dLon = (lon2 - lon1) * rad;
  const lat1Rad = lat1 * rad;
  const lat2Rad = lat2 * rad;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  const brng = Math.atan2(y, x) / rad;
  return (brng + 360) % 360;
};

/**
 * Calculates distance in kilometers between two points (Haversine formula).
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};