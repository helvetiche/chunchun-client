import { useEffect } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/use-auth'
import LoadingScreen from '@/components/loading-screen'

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }
  }, [isAuthenticated, isLoading])

  return <LoadingScreen />
}