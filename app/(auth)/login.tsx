import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Image } from 'react-native'
import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import { useLoginMutation } from '@/hooks/use-auth-mutation'
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
        <View key={`v-${i}`} style={[styles.gridLine, { left: i * gridSize, width: 2, height: '100%' }]} />
      ))}
    </View>
  )
}

const TexturePattern = () => {
  const dotSize = 20
  const dots = []
  for (let row = 0; row < 40; row++) {
    for (let col = 0; col < 20; col++) {
      dots.push(
        <View
          key={`dot-${row}-${col}`}
          style={[
            styles.textureDot,
            {
              top: row * dotSize,
              left: col * dotSize,
            },
          ]}
        />
      )
    }
  }
  return <View style={styles.textureContainer}>{dots}</View>
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedMarketing, setAcceptedMarketing] = useState(false)
  const loginMutation = useLoginMutation()
  const { toast, showError, hideToast } = useToast()

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      showError('Please fill in all fields')
      return
    }

    if (!acceptedTerms) {
      showError('You must accept the terms of service')
      return
    }

    loginMutation.mutate({ email, password }, {
      onSuccess: () => {
        router.replace('/(tabs)')
      },
      onError: (error) => {
        showError(error.message || 'Login failed')
      },
    })
  }, [email, password, acceptedTerms, loginMutation, showError])

  const isLoading = loginMutation.isPending

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
        <View style={styles.whiteContainer}>
        <TexturePattern />
        {/* Header with logo and text */}
        <View style={styles.header}>
          <Image source={require('@/images/logo.png')} style={styles.logo} />
          <View style={styles.textSection}>
            <Text style={styles.brandName}>CHUNCHUN!</Text>
            <Text style={styles.subtitle}>YOUR ACADEMIC WEAPON</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.pill}>
          <View style={styles.pillItem}>
            <FontAwesome5 name="bolt" size={14} color="#fff" solid />
            <Text style={styles.pillText}>EFFECTIVE</Text>
          </View>
          <View style={styles.pillItem}>
            <FontAwesome5 name="tachometer-alt" size={14} color="#fff" solid />
            <Text style={styles.pillText}>FAST</Text>
          </View>
          <View style={styles.pillItem}>
            <FontAwesome5 name="check" size={14} color="#fff" solid />
            <Text style={styles.pillText}>EFFICIENT</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.form}>
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

          <View style={styles.linksRow}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>FORGOT PASSWORD?</Text>
            </TouchableOpacity>
            
            <View style={styles.linkDivider} />
            
            <TouchableOpacity
              onPress={() => router.push('/(auth)/verify-email')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>VERIFY ACCOUNT</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>SIGN IN</Text>
                <FontAwesome5 name="star" size={18} color="white" solid />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.dividerLine} />
            <Text style={styles.footerText}>DON&apos;T HAVE AN ACCOUNT YET?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.registerButtonText}>REGISTER</Text>
              <FontAwesome5 name="star" size={18} color="white" solid />
            </View>
            <View style={styles.freeBadge}>
              <FontAwesome5 name="gift" size={12} color="#fff" solid />
              <Text style={styles.freeBadgeText}>free</Text>
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
    backgroundColor: '#0991f8',
  },
  gradientBottom: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0991f8',
    opacity: 0.5,
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#fff',
    height: 2,
    width: '100%',
  },
  content: {
    padding: 0,
    paddingTop: 40,
    width: '100%',
    maxWidth: 500,
    zIndex: 1,
    flex: 1,
    justifyContent: 'flex-end',
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
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  whiteContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    height: '75%',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  textureContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  textureDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#0991f8',
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
  form: {
    gap: 12,
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
    marginBottom: 0,
    height: 56,
    borderWidth: 1,
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
  registerButton: {
    backgroundColor: '#0991f8',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#0991f8',
    marginTop: 4,
    position: 'relative',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
  freeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#f0f9ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    textTransform: 'uppercase',
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
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  linkButton: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    textDecorationLine: 'underline',
  },
  linkDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#0991f8',
    opacity: 0.3,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    textDecorationLine: 'underline',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#0991f8',
    paddingBottom: 2,
  },
  link: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0991f8',
    textTransform: 'uppercase',
  },
})