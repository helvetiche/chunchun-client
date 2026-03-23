import { useEffect } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/use-auth'
import LoadingScreen from '@/components/loading-screen'

export default function IndexScreen() {
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    console.log('IndexScreen - isLoading:', isLoading)
    console.log('IndexScreen - isAuthenticated:', isAuthenticated)
    console.log('IndexScreen - user:', user)
    console.log('IndexScreen - isDoneSetup:', user?.isDoneSetup)
    
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if setup is completed
        if (user && !user.isDoneSetup) {
          console.log('Redirecting to setup-profile')
          router.replace('/(auth)/setup-profile')
        } else {
          console.log('Redirecting to tabs')
          router.replace('/(tabs)')
        }
      } else {
        console.log('Redirecting to login')
        router.replace('/(auth)/login')
      }
    }
  }, [isAuthenticated, isLoading, user])

  return <LoadingScreen />
}