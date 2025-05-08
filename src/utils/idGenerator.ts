/**
 * Generate a unique ID with a given prefix
 */
export const generateId = (prefix: string = 'id_'): string => {
  return prefix + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};