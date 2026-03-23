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
  idToken?: string
  refreshToken?: string
  expiresIn?: string
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
    isDoneSetup?: boolean
    fullName?: string
    birthday?: string
    address?: string
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    school?: string
    avatarUrl?: string
  }
}

class AuthService {
  private tokenKey = 'chunchun_id_token'
  private refreshTokenKey = 'chunchun_refresh_token'
  private tokenExpiryKey = 'chunchun_token_expiry'

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
      isDoneSetup: false,
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
    
    // Store tokens securely
    if (responseData.idToken) {
      await this.setToken(responseData.idToken)
    }
    if (responseData.refreshToken) {
      await this.setRefreshToken(responseData.refreshToken)
    }
    if (responseData.expiresIn) {
      const expiryTime = Date.now() + parseInt(responseData.expiresIn) * 1000
      await this.setTokenExpiry(expiryTime)
    }

    const userData: User = {
      id: 0,
      uid: responseData.uid,
      name: responseData.user?.name || responseData.name || '',
      email: responseData.user?.email || responseData.email || credentials.email,
      avatar_url: responseData.user?.avatarUrl || null,
      provider: 'email',
      created_at: responseData.user?.createdAt || new Date().toISOString(),
      last_login: new Date().toISOString(),
      isDoneSetup: responseData.user?.isDoneSetup || false,
      fullName: responseData.user?.fullName,
      birthday: responseData.user?.birthday,
      address: responseData.user?.address,
      gender: responseData.user?.gender,
      school: responseData.user?.school,
    }

    console.log('SignIn successful:', userData)
    return { success: true, data: userData }
  }

  async signOut(): Promise<Result<void, ApiError>> {
    console.log('AuthService signOut called')
    
    try {
      const token = await this.getToken()
      if (token) {
        // Call server logout endpoint to revoke tokens
        await apiClient.post(
          API_CONFIG.ENDPOINTS.AUTH_LOGOUT,
          {},
          token
        )
      }
    } catch (error) {
      console.error('Server logout error:', error)
    }
    
    // Clear local tokens
    await this.clearTokens()
    return { success: true, data: undefined }
  }

  async refreshToken(): Promise<Result<string, ApiError>> {
    try {
      const refreshToken = await this.getRefreshToken()
      if (!refreshToken) {
        const error = new Error('No refresh token found') as ApiError
        error.status = 401
        return { success: false, error }
      }

      const result = await apiClient.post<AuthResponseData>(
        API_CONFIG.ENDPOINTS.AUTH_REFRESH,
        { refreshToken }
      )

      if (!result.success) {
        return result
      }

      const responseData = result.data

      // Store new tokens
      if (responseData.idToken) {
        await this.setToken(responseData.idToken)
      }
      if (responseData.refreshToken) {
        await this.setRefreshToken(responseData.refreshToken)
      }
      if (responseData.expiresIn) {
        const expiryTime = Date.now() + parseInt(responseData.expiresIn) * 1000
        await this.setTokenExpiry(expiryTime)
      }

      return { success: true, data: responseData.idToken || '' }
    } catch (error) {
      console.error('Error refreshing token:', error)
      const apiError = new Error('Failed to refresh token') as ApiError
      apiError.status = 401
      return { success: false, error: apiError }
    }
  }

  async getValidToken(): Promise<string | null> {
    const token = await this.getToken()
    if (!token) return null

    // Check if token is expired
    const expiry = await this.getTokenExpiry()
    if (expiry && Date.now() >= expiry - 60000) { // Refresh 1 minute before expiry
      console.log('Token expired or expiring soon, refreshing...')
      const refreshResult = await this.refreshToken()
      if (refreshResult.success) {
        return refreshResult.data
      }
      // If refresh fails, clear tokens
      await this.clearTokens()
      return null
    }

    return token
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

  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.refreshTokenKey, token)
      console.log('Refresh token stored securely')
    } catch (error) {
      console.error('Error storing refresh token:', error)
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.refreshTokenKey)
    } catch (error) {
      console.error('Error retrieving refresh token:', error)
    }
    return null
  }

  async setTokenExpiry(expiry: number): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.tokenExpiryKey, expiry.toString())
    } catch (error) {
      console.error('Error storing token expiry:', error)
    }
  }

  async getTokenExpiry(): Promise<number | null> {
    try {
      const expiry = await SecureStore.getItemAsync(this.tokenExpiryKey)
      return expiry ? parseInt(expiry) : null
    } catch (error) {
      console.error('Error retrieving token expiry:', error)
    }
    return null
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.tokenKey)
      await SecureStore.deleteItemAsync(this.refreshTokenKey)
      await SecureStore.deleteItemAsync(this.tokenExpiryKey)
      console.log('Tokens cleared securely')
    } catch (error) {
      console.error('Error clearing tokens:', error)
    }
  }

  async getCurrentUser(): Promise<Result<User, ApiError>> {
    try {
      const token = await this.getValidToken()
      if (!token) {
        const error = new Error('No valid token found') as ApiError
        error.status = 401
        return { success: false, error }
      }

      const result = await apiClient.get<AuthResponseData>(
        API_CONFIG.ENDPOINTS.AUTH_ME,
        token
      )

      if (!result.success) {
        // If token is invalid, clear tokens
        if (result.error.status === 401) {
          await this.clearTokens()
        }
        return result
      }

      const responseData = result.data
      const userData = responseData.user as {
        name?: string
        email?: string
        avatarUrl?: string
        createdAt?: string
        profileCompleted?: boolean
        fullName?: string
        birthday?: string
        address?: string
        gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
        school?: string
      } | undefined
      
      const user: User = {
        id: 0,
        uid: responseData.uid,
        name: userData?.name || responseData.name || '',
        email: userData?.email || responseData.email || '',
        avatar_url: userData?.avatarUrl || null,
        provider: 'email',
        created_at: userData?.createdAt || new Date().toISOString(),
        last_login: new Date().toISOString(),
        emailVerified: responseData.emailVerified,
        isDoneSetup: (userData as any)?.isDoneSetup || false,
        fullName: userData?.fullName,
        birthday: userData?.birthday,
        address: userData?.address,
        gender: userData?.gender,
        school: userData?.school,
      }

      return { success: true, data: user }
    } catch (error) {
      console.error('Error getting current user:', error)
      const apiError = new Error('Failed to get current user') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
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

  async setupProfile(data: {
    fullName: string
    birthday: string
    address: string
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    school?: string
    avatarUrl?: string
  }): Promise<Result<User, ApiError>> {
    try {
      const token = await this.getValidToken()
      if (!token) {
        const error = new Error('No valid token found') as ApiError
        error.status = 401
        return { success: false, error }
      }

      const result = await apiClient.post<AuthResponseData>(
        API_CONFIG.ENDPOINTS.USER_PROFILE_SETUP,
        data,
        token
      )

      if (!result.success) {
        return result
      }

      const responseData = result.data
      const user: User = {
        id: 0,
        uid: responseData.uid,
        name: data.fullName,
        email: responseData.user?.email || '',
        avatar_url: data.avatarUrl || null,
        provider: 'email',
        created_at: responseData.user?.createdAt || new Date().toISOString(),
        last_login: new Date().toISOString(),
        isDoneSetup: true,
        fullName: data.fullName,
        birthday: data.birthday,
        address: data.address,
        gender: data.gender,
        school: data.school,
      }

      return { success: true, data: user }
    } catch (error) {
      console.error('Error setting up profile:', error)
      const apiError = new Error('Failed to setup profile') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
    }
  }

  async checkUsernameAvailability(username: string): Promise<Result<{ available: boolean }, ApiError>> {
    try {
      const result = await apiClient.get<{ available: boolean }>(
        `/api/users/check-username?username=${encodeURIComponent(username)}`
      )
      return result
    } catch (error) {
      console.error('Error checking username:', error)
      const apiError = new Error('Failed to check username availability') as ApiError
      apiError.status = 500
      return { success: false, error: apiError }
    }
  }
}

export const authService = new AuthService()
