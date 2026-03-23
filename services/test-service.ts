import { apiClient } from './api-client'
import { API_CONFIG } from '@/constants/api'
import type { Result, ApiError } from '@/types'

interface HealthData {
  status: string
  firebase: string
  timestamp: string
  testData?: Record<string, unknown>
}

class TestService {
  async testConnection(): Promise<Result<HealthData, ApiError>> {
    console.log('Testing connection to server...')
    console.log('API Base URL:', API_CONFIG.BASE_URL)
    
    const result = await apiClient.get<HealthData>(
      API_CONFIG.ENDPOINTS.HEALTH
    )

    if (!result.success) {
      console.error('Connection test failed:', result.error)
      return result
    }

    console.log('Connection test successful:', result.data)
    return { success: true, data: result.data }
  }
}

export const testService = new TestService()
