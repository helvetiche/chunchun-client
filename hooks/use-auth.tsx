import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/services/auth-service'
import type { User, AuthState } from '@/types'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  useEffect(() => {
    // Restore auth state from stored token
    const restoreAuthState = async () => {
      try {
        const result = await authService.getCurrentUser()
        
        if (result.success) {
          setAuthState({
            user: result.data,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } else {
          // Token invalid or expired, clear it
          await authService.clearTokens()
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        })
      }
    }

    restoreAuthState()

    // Set up token refresh interval (check every 5 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const token = await authService.getValidToken()
        if (!token) {
          // Session expired, log out
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          })
        }
      } catch (error) {
        console.error('Token refresh check failed:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(refreshInterval)
  }, [])

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await authService.signIn({ email, password })
      if (!result.success) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error.message,
        }))
        throw new Error(result.error.message)
      }
      
      setAuthState({
        user: result.data,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    console.log('Auth hook signUp called')
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      console.log('Calling authService.signUp...')
      const result = await authService.signUp({ name, email, password })
      console.log('AuthService result:', result.success ? 'SUCCESS' : 'FAILED', result.success ? '' : result.error.message)
      
      if (!result.success) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error.message,
        }))
        throw new Error(result.error.message)
      }
      
      setAuthState({
        user: result.data,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
      console.log('SignUp completed successfully')
    } catch (error) {
      console.error('SignUp error in hook:', error)
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await authService.signOut()
      if (!result.success) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error.message,
        }))
        throw new Error(result.error.message)
      }
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const refreshUser = async () => {
    if (!authState.isAuthenticated) return
    
    try {
      const result = await authService.getCurrentUser()
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          user: result.data,
          error: null,
        }))
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}