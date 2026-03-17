import { apiClient } from './api-client'
import { API_CONFIG } from '@/constants/api'
import type { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  Result, 
  ApiError 
} from '@/types'

interface AuthResponse {
  user: User
  session?: {
    id: string
    expiresAt: string
  }
}

class AuthService {
  async signUp(credentials: RegisterCredentials): Promise<Result<User, ApiError>> {
    console.log('AuthService signUp called with:', { email: credentials.email, name: credentials.name })
    
    const result = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_REGISTER,
      credentials
    )

    if (!result.success) {
      console.error('SignUp API error:', result.error)
      return result
    }

    console.log('SignUp successful:', result.data)
    return { success: true, data: result.data.user }
  }

  async signIn(credentials: LoginCredentials): Promise<Result<User, ApiError>> {
    console.log('AuthService signIn called with:', { email: credentials.email })
    
    const result = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_LOGIN,
      credentials
    )

    if (!result.success) {
      console.error('SignIn API error:', result.error)
      return result
    }

    console.log('SignIn successful:', result.data)
    return { success: true, data: result.data.user }
  }

  async signOut(): Promise<Result<void, ApiError>> {
    console.log('AuthService signOut called')
    
    const result = await apiClient.post<void>(
      API_CONFIG.ENDPOINTS.AUTH_LOGOUT
    )

    if (!result.success) {
      console.error('SignOut API error:', result.error)
      return result
    }

    console.log('SignOut successful')
    return { success: true, data: undefined }
  }

  async getCurrentUser(): Promise<Result<User, ApiError>> {
    console.log('AuthService getCurrentUser called')
    
    const result = await apiClient.get<{ user: User }>(
      API_CONFIG.ENDPOINTS.AUTH_ME
    )

    if (!result.success) {
      console.error('GetCurrentUser API error:', result.error)
      return result
    }

    console.log('GetCurrentUser successful:', result.data)
    return { success: true, data: result.data.user }
  }

  async refreshToken(): Promise<Result<string, ApiError>> {
    // Session-based auth doesn't need token refresh
    // The session is automatically validated on each request
    console.log('RefreshToken called - using session-based auth, no refresh needed')
    return { success: true, data: 'session-based' }
  }

  async getToken(): Promise<string | null> {
    // Session-based auth doesn't use tokens
    // The session cookie is automatically sent with requests
    return null
  }

  async logoutAllDevices(): Promise<Result<void, ApiError>> {
    console.log('AuthService logoutAllDevices called')
    
    const result = await apiClient.post<void>(
      API_CONFIG.ENDPOINTS.AUTH_LOGOUT_ALL
    )

    if (!result.success) {
      console.error('LogoutAllDevices API error:', result.error)
      return result
    }

    console.log('LogoutAllDevices successful')
    return { success: true, data: undefined }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<Result<void, ApiError>> {
    console.log('AuthService changePassword called')
    
    const result = await apiClient.post<void>(
      API_CONFIG.ENDPOINTS.AUTH_CHANGE_PASSWORD,
      { currentPassword, newPassword }
    )

    if (!result.success) {
      console.error('ChangePassword API error:', result.error)
      return result
    }

    console.log('ChangePassword successful')
    return { success: true, data: undefined }
  }
}

export const authService = new AuthService()