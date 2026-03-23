import { API_CONFIG, DEFAULT_HEADERS, ERROR_MESSAGES } from '@/constants/api'
import type { ApiResponse, ApiError, Result } from '@/types'

class ApiClient {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
  }

  private getSecurityHeaders(): Record<string, string> {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Result<T, ApiError>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log('API Request:', url)
      console.log('Request options:', JSON.stringify(options, null, 2))
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...options,
        headers: {
          ...DEFAULT_HEADERS,
          ...this.getSecurityHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      // Validate security headers in response
      this.validateResponseHeaders(response)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = new Error(
          errorData.error || this.getErrorMessage(response.status)
        )
        error.status = response.status
        error.details = errorData.details
        return { success: false, error }
      }

      const data: ApiResponse<T> = await response.json()
      
      console.log('API Response data:', JSON.stringify(data, null, 2))
      
      if (!data.success) {
        const error: ApiError = new Error(data.error || ERROR_MESSAGES.UNKNOWN_ERROR)
        error.details = data.details
        return { success: false, error }
      }

      return { success: true, data: data.data as T }
    } catch (error) {
      console.error('API Request error:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        
        if (error.name === 'AbortError') {
          const timeoutError: ApiError = new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
          return { success: false, error: timeoutError }
        }
        
        const apiError: ApiError = new Error(
          error.message || ERROR_MESSAGES.NETWORK_ERROR
        )
        return { success: false, error: apiError }
      }

      const unknownError: ApiError = new Error(ERROR_MESSAGES.UNKNOWN_ERROR)
      return { success: false, error: unknownError }
    }
  }

  private validateResponseHeaders(response: Response): void {
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('application/json')) {
      console.warn('Unexpected content-type:', contentType)
    }

    const xContentTypeOptions = response.headers.get('x-content-type-options')
    if (xContentTypeOptions !== 'nosniff') {
      console.warn('Missing or invalid X-Content-Type-Options header')
    }
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED
      case 403:
        return ERROR_MESSAGES.FORBIDDEN
      case 404:
        return ERROR_MESSAGES.NOT_FOUND
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<Result<T, ApiError>> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    token?: string
  ): Promise<Result<T, ApiError>> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<Result<T, ApiError>> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<Result<T, ApiError>> {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    })
  }
}

export const apiClient = new ApiClient()