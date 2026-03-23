import { View, Text, Animated, StyleSheet, Image } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { FontAwesome5 } from '@expo/vector-icons'

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const progressAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const [isComplete, setIsComplete] = useState(false)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    // Logo scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()

    // Animate progress from 0 to 100 in 1 second
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setIsComplete(true)

      // After showing "Done!", fade out after 500ms
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start(() => {
          onComplete?.()
        })
      }, 500)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim, pointerEvents: isComplete ? 'none' : 'auto' }]}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image source={require('@/images/logo.png')} style={styles.logo} />
        </Animated.View>

        {/* Title with icon */}
        <View style={styles.titleContainer}>
          <FontAwesome5 name="gift" size={24} color="#0991f8" solid />
          <Text style={styles.title}>PREPARING MATERIALS</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    marginBottom: 0,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
  },
  progressContainer: {
    width: 240,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0991f8',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0991f8',
    borderRadius: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#007AFF',
    minWidth: 40,
  },
})
