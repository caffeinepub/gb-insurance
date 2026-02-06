/**
 * Utility to categorize and map backend errors into user-friendly messages
 * Helps distinguish between different failure modes for better UX
 */

export type BackendErrorCategory = 
  | 'trap'           // Backend rejected the call with a trap message
  | 'unauthorized'   // Authentication/authorization failure
  | 'unreachable'    // Network/connectivity issue
  | 'timeout'        // Request timed out
  | 'unknown';       // Other errors

export interface CategorizedError {
  category: BackendErrorCategory;
  message: string;
  originalError: Error;
  canRetry: boolean;
}

/**
 * Categorizes a backend error and returns structured error information
 */
export function categorizeBackendError(error: unknown): CategorizedError {
  const err = error instanceof Error ? error : new Error(String(error));
  const errorMessage = err.message.toLowerCase();

  // Check for trap messages (backend rejection)
  if (errorMessage.includes('trap') || errorMessage.includes('rejected')) {
    return {
      category: 'trap',
      message: extractTrapMessage(err.message),
      originalError: err,
      canRetry: false,
    };
  }

  // Check for unauthorized/authentication errors
  if (
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('not authorized') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('anonymous')
  ) {
    return {
      category: 'unauthorized',
      message: 'You must be authenticated to perform this action. Please sign in with Internet Identity first.',
      originalError: err,
      canRetry: false,
    };
  }

  // Check for timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      category: 'timeout',
      message: 'The request timed out. Please check your connection and try again.',
      originalError: err,
      canRetry: true,
    };
  }

  // Check for network/connectivity errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('unreachable') ||
    errorMessage.includes('failed to fetch')
  ) {
    return {
      category: 'unreachable',
      message: 'Unable to reach the backend. Please check your internet connection and try again.',
      originalError: err,
      canRetry: true,
    };
  }

  // Unknown error
  return {
    category: 'unknown',
    message: err.message || 'An unexpected error occurred. Please try again.',
    originalError: err,
    canRetry: true,
  };
}

/**
 * Extracts a clean trap message from backend error
 * Removes technical prefixes and makes it user-friendly
 */
function extractTrapMessage(rawMessage: string): string {
  // Common patterns in IC trap messages
  const patterns = [
    /trap:\s*(.+)/i,
    /rejected:\s*(.+)/i,
    /error:\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = rawMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If no pattern matches, return the original message
  // but clean up common technical prefixes
  return rawMessage
    .replace(/^(IC\d+:\s*)?/i, '')
    .replace(/^(Call was rejected:\s*)?/i, '')
    .trim();
}

/**
 * Gets a user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const categorized = categorizeBackendError(error);
  return categorized.message;
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const categorized = categorizeBackendError(error);
  return categorized.canRetry;
}
