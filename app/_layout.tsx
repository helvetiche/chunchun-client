import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import * as Font from 'expo-font'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { AuthProvider } from '@/hooks/use-auth'
import { QueryProvider } from '@/providers/query-provider'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins-Regular': require('@/providers/Poppins/Poppins-Regular.ttf'),
          'Poppins-SemiBold': require('@/providers/Poppins/Poppins-SemiBold.ttf'),
          'Poppins-Bold': require('@/providers/Poppins/Poppins-Bold.ttf'),
          'Jua-Regular': require('@/providers/Jua/Jua-Regular.ttf'),
        })
        setFontsLoaded(true)
      } catch (error) {
        console.error('Error loading fonts:', error)
        setFontsLoaded(true)
      }
    }

    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return null
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
