import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Image, ScrollView } from 'react-native'
import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useToast } from '@/hooks/use-toast'
import Toast from '@/components/toast'
import { DatePickerModal } from '@/components/date-picker-modal'
import { authService } from '@/services/auth-service'
import { useAuth } from '@/hooks/use-auth'

const AnimatedStepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <View style={styles.stepperContainer}>
      <View style={styles.pill}>
        <View style={[styles.pillItem, currentStep >= 1 && styles.pillItemActive]}>
          <FontAwesome5 
            name="user" 
            size={14} 
            color={currentStep >= 1 ? '#fff' : 'rgba(255, 255, 255, 0.4)'} 
            solid 
          />
          <Text style={[styles.pillText, currentStep >= 1 && styles.pillTextActive]}>BASIC</Text>
        </View>
        
        <View style={[styles.pillItem, currentStep >= 2 && styles.pillItemActive]}>
          <FontAwesome5 
            name="camera" 
            size={14} 
            color={currentStep >= 2 ? '#fff' : 'rgba(255, 255, 255, 0.4)'} 
            solid 
          />
          <Text style={[styles.pillText, currentStep >= 2 && styles.pillTextActive]}>PHOTO</Text>
        </View>
      </View>
      <Text style={styles.stepIndicator}>STEP {currentStep} OF 2</Text>
    </View>
  )
}

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

export default function SetupProfileScreen() {
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast, showError, showSuccess, hideToast } = useToast()

  // Form data
  const [fullName, setFullName] = useState('')
  const [birthday, setBirthday] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (status !== 'granted') {
      showError('Sorry, we need camera roll permissions!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  const handleDateSelect = useCallback((date: Date) => {
    setBirthday(date)
  }, [])

  const validateUsername = useCallback((username: string) => {
    if (!username.trim()) {
      setUsernameError('Username is required')
      return false
    }

    if (username.length < 1) {
      setUsernameError('Username is required')
      return false
    }

    if (username.length > 18) {
      setUsernameError('Username must be 18 characters or less')
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores')
      return false
    }

    setUsernameError('')
    return true
  }, [])

  const handleUsernameChange = (text: string) => {
    const cleanText = text.replace(/[^a-zA-Z0-9_]/g, '')
    setFullName(cleanText)
    if (cleanText) {
      validateUsername(cleanText)
    } else {
      setUsernameError('')
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        showError('Please enter your username')
        return
      }
      if (usernameError) {
        showError(usernameError)
        return
      }
      setStep(2)
    }
  }

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    
    try {
      const profileData = {
        fullName,
        birthday: birthday.toISOString().split('T')[0],
        address: '',
        gender,
        avatarUrl: avatarUri || undefined,
      }
      
      console.log('Submitting profile data:', profileData)
      
      const result = await authService.setupProfile(profileData)

      if (!result.success) {
        showError(result.error.message || 'Failed to setup profile')
        setIsLoading(false)
        return
      }

      console.log('Profile setup successful, user data:', result.data)
      showSuccess('Profile setup complete!')
      await refreshUser()
      
      setTimeout(() => {
        router.replace('/(tabs)')
      }, 1000)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to setup profile')
      setIsLoading(false)
    }
  }, [fullName, birthday, gender, avatarUri, showError, showSuccess, refreshUser])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

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
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Welcome Header */}
          {step === 1 && (
            <View style={styles.welcomeSection}>
              <View style={styles.header}>
                <Image source={require('@/images/logo.png')} style={styles.logo} />
                <Text style={styles.welcomeTitle}>WELCOME TO{'\n'}CHUNCHUN!</Text>
              </View>
              <Text style={styles.welcomeSubtitle}>
                LET'S SET UP YOUR PROFILE TO PERSONALIZE YOUR EXPERIENCE
              </Text>
            </View>
          )}

          {step === 2 && (
            <View style={styles.welcomeSection}>
              <FontAwesome5 name="user-circle" size={48} color="#fff" solid />
              <Text style={styles.welcomeTitle}>FINAL STEP!</Text>
              <Text style={styles.welcomeSubtitle}>
                COMPLETE YOUR PROFILE WITH A PHOTO
              </Text>
            </View>
          )}

          {/* Animated Stepper */}
          <AnimatedStepper currentStep={step} />

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={[styles.inputWrapper, usernameError && styles.inputWrapperError]}>
                  <Text style={styles.atSymbol}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    value={fullName}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                    editable={!checkingUsername}
                  />
                  {checkingUsername && (
                    <FontAwesome5 name="spinner" size={16} color="#0991f8" solid />
                  )}
                </View>
                {usernameError && (
                  <Text style={styles.errorText}>{usernameError}</Text>
                )}
                {fullName && !usernameError && (
                  <Text style={styles.successText}>Your username will be: {fullName.toUpperCase()}#00001</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>BIRTHDAY</Text>
                <TouchableOpacity 
                  style={styles.inputWrapper}
                  onPress={() => setShowDatePicker(true)}
                >
                  <FontAwesome5 name="birthday-cake" size={18} color="#0991f8" style={styles.inputIcon} solid />
                  <Text style={styles.dateText}>{formatDate(birthday)}</Text>
                  <FontAwesome5 name="calendar" size={18} color="#0991f8" solid />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DatePickerModal
                  visible={showDatePicker}
                  selectedDate={birthday}
                  onDateSelect={handleDateSelect}
                  onClose={() => setShowDatePicker(false)}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>GENDER</Text>
                <View style={styles.genderRow}>
                  {[
                    { value: 'male', icon: 'mars', label: 'Male', color: '#0991f8' },
                    { value: 'female', icon: 'venus', label: 'Female', color: '#ff1493' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        styles.genderOptionSmall,
                        gender === option.value && styles.genderOptionSelected,
                      ]}
                      onPress={() => setGender(option.value as typeof gender)}
                    >
                      {gender === option.value && (
                        <View style={[styles.selectedBadge, { backgroundColor: option.color }]}>
                          <FontAwesome5 name="check" size={10} color="#fff" solid />
                          <Text style={styles.selectedBadgeText}>SELECTED</Text>
                        </View>
                      )}
                      <View style={[
                        styles.genderIconBackground,
                        gender === option.value && { backgroundColor: option.color }
                      ]}>
                        <FontAwesome5 
                          name={option.icon} 
                          size={20} 
                          color={gender === option.value ? '#fff' : '#0991f8'} 
                          solid 
                        />
                      </View>
                      <Text style={[
                        styles.genderOptionText,
                        gender === option.value && styles.genderOptionTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleNext}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>CONTINUE</Text>
                  <FontAwesome5 name="arrow-right" size={18} color="#0991f8" solid />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Photo */}
          {step === 2 && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PROFILE PICTURE (OPTIONAL)</Text>
                <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <FontAwesome5 name="camera" size={32} color="#0991f8" solid />
                      <Text style={styles.avatarPlaceholderText}>TAP TO ADD PHOTO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(1)}
                  disabled={isLoading}
                >
                  <FontAwesome5 name="arrow-left" size={18} color="#fff" solid />
                  <Text style={styles.backButtonText}>BACK</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#0991f8" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>COMPLETE SETUP</Text>
                      <FontAwesome5 name="check" size={18} color="#0991f8" solid />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  textSection: {
    marginLeft: 12,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: 'Jua-Regular',
    color: '#fff',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono-Regular',
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  stepperContainer: {
    width: '100%',
    paddingVertical: 3,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
    gap: 0,
    width: '90%',
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    flex: 1,
  },
  pillItemActive: {
    opacity: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Jua-Regular',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  pillTextActive: {
    color: '#fff',
  },
  stepIndicator: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#fff',
    opacity: 0.8,
  },
  separator: {
    height: 2,
    backgroundColor: '#fff',
    opacity: 0.3,
    marginVertical: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono-Medium',
    color: '#fff',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'JetBrainsMono-Regular',
    color: '#ff6b6b',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    fontFamily: 'JetBrainsMono-Regular',
    color: '#51cf66',
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    minHeight: 56,
    paddingVertical: 12,
  },
  inputWrapperError: {
    borderColor: '#ff6b6b',
  },
  inputIcon: {
    marginRight: 12,
  },
  atSymbol: {
    fontSize: 18,
    fontFamily: 'JetBrainsMono-Regular',
    color: '#0991f8',
    marginRight: 4,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'JetBrainsMono-Regular',
    color: '#000',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'JetBrainsMono-Regular',
    color: '#000',
  },
  genderOptions: {
    gap: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: '#fff',
    position: 'relative',
  },
  genderOptionSmall: {
    flex: 1,
  },
  genderIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontFamily: 'Jua-Regular',
    color: '#fff',
    fontWeight: '600',
  },
  genderOptionSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  genderOptionText: {
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    color: '#000',
  },
  genderOptionTextSelected: {
    color: '#000',
  },
  avatarPicker: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholderText: {
    fontSize: 12,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#0991f8',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    letterSpacing: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    height: 56,
    justifyContent: 'center',
    minWidth: 120,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Jua-Regular',
  },
})
