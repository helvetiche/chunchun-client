// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User Types
export interface User {
  id: number
  uid?: string
  name: string
  email: string
  avatar_url: string | null
  provider: 'email' | 'google' | 'apple'
  created_at: string
  last_login: string | null
  emailVerified?: boolean
}

export interface CreateUserData {
  name: string
  email: string
}

export interface UpdateUserData {
  name?: string
  email?: string
}

// Authentication Types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  acceptedTerms?: boolean
  acceptedMarketing?: boolean
}

// API Error Types
export interface ApiError extends Error {
  status?: number
  details?: string
}

// Result Pattern for Error Handling
export type Result<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E }