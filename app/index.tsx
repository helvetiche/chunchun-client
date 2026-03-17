import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/use-auth'
import { ThemedText } from '@/components/themed-text'

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

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText style={styles.text}>Loading...</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})