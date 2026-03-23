import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useCallback } from 'react'
import { router } from 'expo-router'
import { useLogoutMutation } from '@/hooks/use-auth-mutation'

export default function HomeScreen() {
  const logoutMutation = useLogoutMutation()

  const handleLogout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace('/(auth)/login')
      },
    })
  }, [logoutMutation])

  const isLoading = logoutMutation.isPending

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>You&apos;re logged in</Text>
      
      <TouchableOpacity
        style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.logoutButtonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
