import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { authService } from '@/services/auth-service'
import { useToast } from '@/hooks/use-toast'
import Toast from '@/components/toast'

export default function ResetPasswordScreen() {
  const { oobCode } = useLocalSearchParams<{ oobCode: string }>()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast, showSuccess, showError, hideToast } = useToast()

  const handleSubmit = useCallback(async () => {
    if (!newPassword || !confirmPassword) {
      showError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }

    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      showError('Password must contain uppercase, lowercase, and numbers')
      return
    }

    if (!oobCode) {
      showError('Invalid reset link')
      return
    }

    setIsLoading(true)

    const result = await authService.resetPassword(oobCode, newPassword)

    if (result.success) {
      showSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        router.replace('/(auth)/login')
      }, 2000)
    } else {
      showError(result.error.message)
    }

    setIsLoading(false)
  }, [newPassword, confirmPassword, oobCode, showSuccess, showError])

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
          <FontAwesome5 name="lock" size={80} color="#0991f8" solid />
        </View>

        <Text style={styles.title}>RESET PASSWORD</Text>
        <Text style={styles.subtitle}>
          Enter your new password below.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <FontAwesome5 name="lock" size={18} color="#0991f8" style={styles.inputIcon} solid />
            <TextInput
              style={styles.input}
              placeholder="NEW PASSWORD"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
              <FontAwesome5 
                name={showPassword ? 'eye-slash' : 'eye'} 
                size={18} 
                color="#0991f8"
                solid
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <FontAwesome5 name="check" size={18} color="#0991f8" style={styles.inputIcon} solid />
            <TextInput
              style={styles.input}
              placeholder="CONFIRM PASSWORD"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
              <FontAwesome5 
                name={showConfirmPassword ? 'eye-slash' : 'eye'} 
                size={18} 
                color="#0991f8"
                solid
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>PASSWORD REQUIREMENTS:</Text>
            <Text style={styles.requirementText}>• At least 8 characters</Text>
            <Text style={styles.requirementText}>• Contains uppercase letter</Text>
            <Text style={styles.requirementText}>• Contains lowercase letter</Text>
            <Text style={styles.requirementText}>• Contains number</Text>
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
                <Text style={styles.buttonText}>RESET PASSWORD</Text>
                <FontAwesome5 name="check" size={18} color="white" solid />
              </View>
            )}
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
  passwordRequirements: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0991f8',
  },
  requirementsTitle: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    lineHeight: 18,
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
})
