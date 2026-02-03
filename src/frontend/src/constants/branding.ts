/**
 * GB Insurance Branding Constants
 * Centralized source of truth for all brand assets and identity
 */

export const BRANDING = {
  logo: {
    main: '/assets/image1-1.png',
    favicon: '/assets/generated/gb-favicon.dim_32x32.png',
    alt: 'GB Insurance Logo',
  },
  company: {
    name: 'GB Insurance',
    tagline: 'Har Mushkil Mein, Apno Jaisa Saath.',
    description: 'Your trusted partner for comprehensive insurance solutions across India.',
  },
  contact: {
    phone: '1800-123-4567',
    email: 'support@gbinsurance.in',
    address: 'Mumbai, Maharashtra, India',
  },
} as const;
