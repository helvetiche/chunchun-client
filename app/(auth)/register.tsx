import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Image } from 'react-native'
import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { useRegisterMutation } from '@/hooks/use-auth-mutation'
import { useToast } from '@/hooks/use-toast'
import Toast from '@/components/toast'

const GridBackground = () => {
  const gridSize = 40
  return (
    <View style={styles.gridBackground}>
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={`h-${i}`} style={[styles.gridLine, { top: i * gridSize }]} />
      ))}
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={`v-${i}`} style={[styles.gridLine, { left: i * gridSize, width: 1, height: '100%' }]} />
      ))}
    </View>
  )
}

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedMarketing, setAcceptedMarketing] = useState(false)
  const registerMutation = useRegisterMutation()
  const { toast, showError, hideToast } = useToast()

  const handleRegister = useCallback(() => {
    if (!name || !email || !password || !confirmPassword) {
      showError('Please fill in all fields')
      return
    }

    if (!acceptedTerms) {
      showError('You must accept the terms of service')
      return
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    // Match server validation: 8+ chars with uppercase, lowercase, and numbers
    if (password.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      showError('Password must contain uppercase, lowercase, and numbers')
      return
    }

    registerMutation.mutate(
      { 
        name, 
        email, 
        password,
        acceptedTerms,
        acceptedMarketing,
      }, 
      {
        onSuccess: () => {
          router.push({
            pathname: '/(auth)/verify-email',
            params: { email },
          })
        },
        onError: (error) => {
          showError(error.message || 'Registration failed')
        },
      }
    )
  }, [name, email, password, confirmPassword, acceptedTerms, acceptedMarketing, registerMutation, showError])

  const isLoading = registerMutation.isPending

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
      <GridBackground />
      <View style={styles.content}>
        {/* Header with logo and text */}
        <View style={styles.header}>
          <Image source={require('@/images/logo.png')} style={styles.logo} />
          <View style={styles.textSection}>
            <Text style={styles.brandName}>CHUNCHUN!</Text>
            <Text style={styles.subtitle}>JOIN THE COMMUNITY</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.pill}>
          <View style={styles.pillItem}>
            <FontAwesome5 name="bolt" size={14} color="#fff" solid />
            <Text style={styles.pillText}>EFFECTIVE</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pillItem}>
            <FontAwesome5 name="tachometer-alt" size={14} color="#fff" solid />
            <Text style={styles.pillText}>FAST</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.pillItem}>
            <FontAwesome5 name="check" size={14} color="#fff" solid />
            <Text style={styles.pillText}>EFFICIENT</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="user" size={18} color="#0991f8" style={styles.inputIcon} solid />
              <TextInput
                style={styles.input}
                placeholder="ENTER YOUR FULL NAME"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="heart" size={18} color="#0991f8" style={styles.inputIcon} solid />
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
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="lock" size={18} color="#0991f8" style={styles.inputIcon} solid />
              <TextInput
                style={styles.input}
                placeholder="ENTER YOUR PASSWORD"
                value={password}
                onChangeText={setPassword}
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
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="check" size={18} color="#0991f8" style={styles.inputIcon} solid />
              <TextInput
                style={styles.input}
                placeholder="CONFIRM YOUR PASSWORD"
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
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                <FontAwesome5 name="arrow-right" size={18} color="white" solid />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.dividerLine} />
            <Text style={styles.footerText}>ALREADY HAVE AN ACCOUNT?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.signInButtonText}>SIGN IN</Text>
              <FontAwesome5 name="arrow-right" size={18} color="white" solid />
            </View>
          </TouchableOpacity>

          <View style={styles.complianceContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              {acceptedTerms && (
                <FontAwesome5 name="check" size={12} color="#fff" solid />
              )}
            </TouchableOpacity>
            <Text style={styles.complianceText}>
              I AGREE TO THE TERMS OF SERVICE AND PRIVACY POLICY
            </Text>
          </View>

          <View style={styles.complianceContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, acceptedMarketing && styles.checkboxChecked]}
              onPress={() => setAcceptedMarketing(!acceptedMarketing)}
            >
              {acceptedMarketing && (
                <FontAwesome5 name="check" size={12} color="#fff" solid />
              )}
            </TouchableOpacity>
            <Text style={styles.complianceText}>
              I CONSENT TO RECEIVE PROMOTIONAL EMAILS AND UPDATES
            </Text>
          </View>
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
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#0991f8',
    height: 1,
    width: '100%',
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 500,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 8,
  },
  textSection: {
    flex: 1,
  },
  brandName: {
    fontSize: 36,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    letterSpacing: 2,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    padding: 8,
  },
  form: {
    gap: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#0991f8',
    opacity: 0.2,
    marginVertical: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0991f8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0991f8',
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  pillDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#fff',
    opacity: 1,
    marginHorizontal: 12,
  },
  pillText: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#fff',
  },
  pillContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  inputGroup: {
    gap: 8,
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
    marginTop: 12,
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
    color: '#f5f1ed',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#0991f8',
    opacity: 0.2,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
  },
  signInButton: {
    backgroundColor: '#0991f8',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#0991f8',
    marginTop: 4,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
  complianceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0991f8',
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0991f8',
  },
  complianceText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    lineHeight: 18,
  },
})