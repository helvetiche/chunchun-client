import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const { user, signOut, isLoading } = useAuth()

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
            } catch {
              Alert.alert('Error', 'Failed to logout')
            }
          },
        },
      ]
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Welcome to Chunchun</ThemedText>
        
        {user && (
          <ThemedView style={styles.userInfo}>
            <ThemedText style={styles.greeting}>Hello, {user.name}!</ThemedText>
            <ThemedText style={styles.email}>{user.email}</ThemedText>
          </ThemedView>
        )}
        
        <ThemedText style={styles.subtitle}>Your personal assistant app</ThemedText>
        
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <ThemedText style={styles.logoutButtonText}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
});
