// API Configuration
const isDev = process.env.NODE_ENV === 'development' || __DEV__

export const API_CONFIG = {
  BASE_URL: isDev
    ? 'http://localhost:8787' // Local Cloudflare Workers dev server
    : 'https://chunchun-server.helvetiche.workers.dev', // Production
  ENDPOINTS: {
    // Public endpoints
    HEALTH: '/health',
    
    // Auth endpoints
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_ME: '/auth/me',
    AUTH_SESSIONS: '/auth/sessions',
    AUTH_LOGOUT_ALL: '/auth/logout-all',
    AUTH_CHANGE_PASSWORD: '/auth/change-password',
    
    // User endpoints
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
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
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const