// API Configuration
const isDev = process.env.NODE_ENV === 'development' || __DEV__

export const API_CONFIG = {
  BASE_URL: isDev
    ? 'http://localhost:3000/api' // Local Next.js dev server
    : 'https://chunchun-api.vercel.app/api', // Production
  ENDPOINTS: {
    // Public endpoints
    HEALTH: '/health',
    
    // Auth endpoints
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_ME: '/auth/me',
    AUTH_OAUTH: '/auth/oauth',
    AUTH_VERIFY_EMAIL: '/auth/verify-email',
    AUTH_RESEND_VERIFICATION: '/auth/resend-verification',
    AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
    AUTH_RESET_PASSWORD: '/auth/reset-password',
    
    // User endpoints
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    USER_PROFILE_SETUP: '/users/profile-setup',
  },
  TIMEOUT: 10000, // 10 seconds
} as const

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh session. Please log in again.',
} as const