import { Principal } from '@dfinity/principal';

export interface PrincipalValidationResult {
  isValid: boolean;
  principal?: Principal;
  error?: string;
}

/**
 * Validates and parses a Principal text input
 * @param principalText - The text representation of a Principal
 * @returns Validation result with parsed Principal or error message
 */
export function validatePrincipal(principalText: string): PrincipalValidationResult {
  if (!principalText || principalText.trim() === '') {
    return {
      isValid: false,
      error: 'Principal cannot be empty',
    };
  }

  const trimmed = principalText.trim();

  try {
    const principal = Principal.fromText(trimmed);
    
    // Check if it's the anonymous principal
    if (principal.isAnonymous()) {
      return {
        isValid: false,
        error: 'Cannot use anonymous principal',
      };
    }

    return {
      isValid: true,
      principal,
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: 'Invalid principal format. Please check the principal ID and try again.',
    };
  }
}

/**
 * Formats a Principal for display (shortened version)
 * @param principal - The Principal to format
 * @param maxLength - Maximum length before truncation (default: 20)
 * @returns Formatted principal string
 */
export function formatPrincipal(principal: Principal, maxLength: number = 20): string {
  const text = principal.toString();
  if (text.length <= maxLength) {
    return text;
  }
  const start = Math.floor(maxLength / 2) - 2;
  const end = Math.floor(maxLength / 2) - 2;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}
