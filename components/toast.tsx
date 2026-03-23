import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  visible: boolean
  onHide?: () => void
  duration?: number
}

export default function Toast({ 
  message, 
  type = 'error', 
  visible, 
  onHide,
  duration = 4000 
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.()
    })
  }

  if (!visible && translateY._value === -100) {
    return null
  }

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast
      case 'error':
        return styles.errorToast
      case 'warning':
        return styles.warningToast
      case 'info':
        return styles.infoToast
      default:
        return styles.errorToast
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle'
      case 'error':
        return 'exclamation-circle'
      case 'warning':
        return 'exclamation-triangle'
      case 'info':
        return 'info-circle'
      default:
        return 'exclamation-circle'
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <FontAwesome5 name={getIcon()} size={20} color="#fff" solid />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successToast: {
    backgroundColor: '#22c55e',
  },
  errorToast: {
    backgroundColor: '#ff0000',
  },
  warningToast: {
    backgroundColor: '#f59e0b',
  },
  infoToast: {
    backgroundColor: '#0991f8',
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Jua-Regular',
    textTransform: 'uppercase',
  },
})
