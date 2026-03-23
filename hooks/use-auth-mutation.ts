import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth-service'
import { logger } from '@/lib/logger'
import type { LoginCredentials, RegisterCredentials, User, ApiError } from '@/types'

export function useLoginMutation() {
  return useMutation<User, ApiError, LoginCredentials>({
    mutationFn: async (credentials) => {
      logger.debug('Login mutation started', { email: credentials.email })
      const result = await authService.signIn(credentials)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: (user) => {
      logger.info('Login successful', { uid: user.uid, email: user.email })
    },
    onError: (error) => {
      logger.error('Login failed', error)
    },
  })
}

export function useRegisterMutation() {
  return useMutation<User, ApiError, RegisterCredentials>({
    mutationFn: async (credentials) => {
      logger.debug('Register mutation started', { email: credentials.email })
      const result = await authService.signUp(credentials)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: (user) => {
      logger.info('Registration successful', { uid: user.uid, email: user.email })
    },
    onError: (error) => {
      logger.error('Registration failed', error)
    },
  })
}

export function useLogoutMutation() {
  return useMutation<void, ApiError>({
    mutationFn: async () => {
      logger.debug('Logout mutation started')
      const result = await authService.signOut()
      if (!result.success) {
        throw result.error
      }
    },
    onSuccess: () => {
      logger.info('Logout successful')
    },
    onError: (error) => {
      logger.error('Logout failed', error)
    },
  })
}
