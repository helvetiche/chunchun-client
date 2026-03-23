import * as SecureStore from 'expo-secure-store'
import { apiClient } from './api-client'
import { API_CONFIG } from '@/constants/api'
import type { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  Result, 
  ApiError 
} from '@/types'

interface AuthResponseData {
  uid: string
  token?: string
  email?: string
  name?: string
  emailVerified?: boolean
  message?: string
  verificationLink?: string
  resetLink?: string
  user?: {
    uid: string
    email: string
    name: string
    createdAt: string
    updatedAt: string
    emailVerified?: boolean
  }
}

class AuthService {
  private tokenKey = 'chunchun_auth_token'

  async signUp(credentials: RegisterCredentials): Promise<Result<User, ApiError>> {
    console.log('AuthService signUp called')
    
    const result = await apiClient.post<AuthResponseData>(
      API_CONFIG.ENDPOINTS.AUTH_REGISTER,
      credentials
    )

    if (!result.success) {
      console.error('SignUp API error:', result.error)
      return result
    }

    const responseData = result.data

    const user: User = {
      id: 0,
      uid: responseData.uid,
      name: responseData.name || credentials.name,
      email: responseData.email || credentials.email,
      avatar_url: null,
      provider: 'email',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      emailVerified: responseData.emailVerified || false,
    }

    console.log('SignUp successful:', user)
    return { success: true, data: user }
  }

  async signIn(credentials: LoginCredentials): Promise<Result<User, ApiError>> {
    console.log('AuthService signIn called')
    
    const result = await apiClient.post<AuthResponseData>(
      API_CONFIG.ENDPOINTS.AUTH_LOGIN,
      credentials
    )

    if (!result.success) {
      console.error('SignIn API error:', result.error)
      return result
    }

    const responseData = result.data
    
    // Store token securely
    if (responseData.token) {
      await this.setToken(responseData.token)
    }

    const userData: User = {
      id: 0,
      uid: responseData.uid,
      name: responseData.user?.name || responseData.name || '',
      email: responseData.user?.email || responseData.email || credentials.email,
      avatar_url: null,
      provider: 'email',
      created_at: responseData.user?.createdAt || new Date().toISOString(),
      last_login: new Date().toISOString(),
    }

    console.log('SignIn successful:', userData)
    return { success: true, data: userData }
  }

  async signOut(): Promise<Result<void, ApiError>> {
    console.log('AuthService signOut called')
    
    // Call server logout endpoint
    try {
      const token = await this.getToken()
      if (token) {
        await apiClient.post(
          API_CONFIG.ENDPOINTS.AUTH_LOGOUT,
          {},
          token
        )
      }
    } catch (error) {
      console.error('Server logout error:', error)
    }
    
    // Clear local token
    await this.clearToken()
    return { success: true, data: undefined }
  }

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.tokenKey, token)
      console.log('Token stored securely')
    } catch (error) {
      console.error('Error storing token:', error)
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.tokenKey)
    } catch (error) {
      console.error('Error retrieving token:', error)
    }
    return null
  }

  async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.tokenKey)
      console.log('Token cleared securely')
    } catch (error) {
      console.error('Error clearing token:', error)
    }
  }

  async getCurrentUser(): Promise<Result<User, ApiError>> {
    try {
      const token = await this.getToken()
      if (!token) {
        const error = new Error('No token found') as ApiError
        error.status = 401
        return {
          success: false,
          error
        }
      }

      const result = await apiClient.get<AuthResponseData>(
        API_CONFIG.ENDPOINTS.AUTH_LOGIN,
        token
      )

      if (!result.success) {
        return result
      }

      const responseData = result.data
      const user: User = {
        id: 0,
        uid: responseData.uid,
        name: responseData.user?.name || responseData.name || '',
        email: responseData.user?.email || responseData.email || '',
        avatar_url: null,
        provider: 'email',
        created_at: responseData.user?.createdAt || new Date().toISOString(),
        last_login: new Date().toISOString(),
      }

      return { success: true, data: user }
    } catch (error) {
      console.error('Error getting current user:', error)
      const apiError = new Error('Failed to get current user') as ApiError
      apiError.status = 500
      return {
        success: false,
        error: apiError
      }
    }
  }

  async verifyEmail(oobCode: string): Promise<Result<void, ApiError>> {
    try {
      const result = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH_VERIFY_EMAIL,
        { oobCode }
      )

      if (!result.success) {
        return result
      }

      return { success: true, data: undefined }
    } catch (error) {
      console.error('Error verifying email:', error)
      const apiError = new Error('Failed to verify email') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
    }
  }

  async resendVerification(email: string): Promise<Result<void, ApiError>> {
    try {
      const result = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH_RESEND_VERIFICATION,
        { email }
      )

      if (!result.success) {
        return result
      }

      return { success: true, data: undefined }
    } catch (error) {
      console.error('Error resending verification:', error)
      const apiError = new Error('Failed to resend verification email') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
    }
  }

  async forgotPassword(email: string): Promise<Result<void, ApiError>> {
    try {
      const result = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH_FORGOT_PASSWORD,
        { email }
      )

      if (!result.success) {
        return result
      }

      return { success: true, data: undefined }
    } catch (error) {
      console.error('Error requesting password reset:', error)
      const apiError = new Error('Failed to request password reset') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
    }
  }

  async resetPassword(oobCode: string, newPassword: string): Promise<Result<void, ApiError>> {
    try {
      const result = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH_RESET_PASSWORD,
        { oobCode, newPassword }
      )

      if (!result.success) {
        return result
      }

      return { success: true, data: undefined }
    } catch (error) {
      console.error('Error resetting password:', error)
      const apiError = new Error('Failed to reset password') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
    }
  }
}

export const authService = new AuthService()
