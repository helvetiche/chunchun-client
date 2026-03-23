import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { authService } from '@/services/auth-service'
import { useToast } from '@/hooks/use-toast'
import Toast from '@/components/toast'

export default function VerifyEmailScreen() {
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>()
  const [email, setEmail] = useState(paramEmail || '')
  const [isResending, setIsResending] = useState(false)
  const { toast, showSuccess, showError, hideToast } = useToast()

  const handleResendEmail = useCallback(async () => {
    if (!email) {
      showError('Please enter your email address')
      return
    }

    setIsResending(true)

    const result = await authService.resendVerification(email)

    if (result.success) {
      showSuccess('Verification email sent! Check your inbox.')
    } else {
      showError(result.error.message)
    }

    setIsResending(false)
  }, [email, showSuccess, showError])

  const handleBackToLogin = useCallback(() => {
    router.replace('/(auth)/login')
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
          <FontAwesome5 name="envelope" size={80} color="#0991f8" solid />
        </View>

        <Text style={styles.title}>VERIFY YOUR EMAIL</Text>
        <Text style={styles.subtitle}>
          {paramEmail 
            ? "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account."
            : "Enter your email address to resend the verification link."}
        </Text>

        {!paramEmail && (
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="envelope" size={18} color="#0991f8" style={styles.inputIcon} solid />
            <TextInput
              style={styles.input}
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isResending}
              placeholderTextColor="#999"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isResending && styles.buttonDisabled]}
          onPress={handleResendEmail}
          disabled={isResending}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              {isResending ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
            </Text>
            <FontAwesome5 name="paper-plane" size={18} color="white" solid />
          </View>
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

        <View style={styles.infoBox}>
          <FontAwesome5 name="info-circle" size={16} color="#0991f8" solid />
          <Text style={styles.infoText}>
            Didn't receive the email? Check your spam folder or click the resend button above.
          </Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0991f8',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    height: 56,
    marginBottom: 20,
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
    marginBottom: 16,
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
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#0991f8',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0991f8',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    lineHeight: 18,
  },
})
