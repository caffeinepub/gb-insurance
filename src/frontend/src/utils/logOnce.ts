/**
 * Utility to log predictable errors only once per error key
 * Prevents console spam during retries and route transitions
 */

const loggedErrors = new Set<string>();

/**
 * Log an error message only once per unique key
 * Subsequent calls with the same key will be ignored
 *
 * @param key - Unique identifier for this error type
 * @param message - Error message to log
 * @param data - Optional additional data to log
 */
export function logOnce(key: string, message: string, data?: any): void {
  if (loggedErrors.has(key)) {
    return;
  }

  loggedErrors.add(key);
  
  if (data !== undefined) {
    console.error(`[${key}] ${message}`, data);
  } else {
    console.error(`[${key}] ${message}`);
  }
}

/**
 * Clear a specific logged error key
 * Allows the error to be logged again
 *
 * @param key - The error key to clear
 */
export function clearLoggedError(key: string): void {
  loggedErrors.delete(key);
}

/**
 * Clear all logged errors
 * Useful when resetting application state
 */
export function clearAllLoggedErrors(): void {
  loggedErrors.clear();
}
