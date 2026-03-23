import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native'
import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { authService } from '@/services/auth-service'
import { useToast } from '@/hooks/use-toast'
import Toast from '@/components/toast'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast, showSuccess, showError, hideToast } = useToast()

  const handleSubmit = useCallback(async () => {
    if (!email) {
      showError('Please enter your email address')
      return
    }

    setIsLoading(true)

    const result = await authService.forgotPassword(email)

    if (result.success) {
      showSuccess('If the email exists, a password reset link has been sent. Check your inbox.')
    } else {
      showError(result.error.message)
    }

    setIsLoading(false)
  }, [email, showSuccess, showError])

  const handleBackToLogin = useCallback(() => {
    router.back()
  }, [])

  return (
    <View style={styles.container}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="key" size={80} color="#0991f8" solid />
        </View>

        <Text style={styles.title}>FORGOT PASSWORD?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="envelope" size={18} color="#0991f8" style={styles.inputIcon} solid />
            <TextInput
              style={styles.input}
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>SEND RESET LINK</Text>
                <FontAwesome5 name="paper-plane" size={18} color="white" solid />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToLogin}
          >
            <View style={styles.buttonContent}>
              <FontAwesome5 name="arrow-left" size={18} color="#0991f8" solid />
              <Text style={styles.secondaryButtonText}>BACK TO LOGIN</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f9ff',
  },
  gradientBottom: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e0f2fe',
    opacity: 0.5,
  },
  content: {
    padding: 24,
    width: '100%',
    maxWidth: 500,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0991f8',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    color: '#000',
  },
  button: {
    backgroundColor: '#0991f8',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 3,
    borderColor: '#0991f8',
  },
  buttonDisabled: {
    backgroundColor: '#999',
    borderColor: '#999',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 2,
    borderColor: '#0991f8',
  },
  secondaryButtonText: {
    color: '#0991f8',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
})
