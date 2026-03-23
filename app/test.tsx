import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { testService } from '@/services/test-service'

export default function TestScreen() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTestConnection = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await testService.testConnection()

      if (response.success) {
        setResult(JSON.stringify(response.data, null, 2))
      } else {
        setError(response.error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
          Firebase Connection Test
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: loading ? '#ccc' : '#007AFF',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
          }}
          onPress={handleTestConnection}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Test Connection
            </Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={{ backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ color: '#c33', fontWeight: '600', marginBottom: 8 }}>Error:</Text>
            <Text style={{ color: '#c33', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {result && (
          <View style={{ backgroundColor: '#efe', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#3c3', fontWeight: '600', marginBottom: 8 }}>Success:</Text>
            <Text style={{ color: '#333', fontSize: 12, fontFamily: 'monospace' }}>{result}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
