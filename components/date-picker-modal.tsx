import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { FontAwesome5 } from '@expo/vector-icons'

interface DatePickerModalProps {
  visible: boolean
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onClose: () => void
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 100
  const maxYear = currentYear

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDayPress = (day: any) => {
    const newDate = new Date(day.dateString)
    setCurrentDate(newDate)
    onDateSelect(newDate)
    onClose()
  }

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(year)
    setCurrentDate(newDate)
    setShowYearPicker(false)
  }

  const markedDates = {
    [formatDate(currentDate)]: {
      selected: true,
      selectedColor: '#0991f8',
      selectedTextColor: '#fff',
    },
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>SELECT YOUR BIRTHDAY</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {!showYearPicker ? (
            <>
              <TouchableOpacity 
                style={styles.yearSelector}
                onPress={() => setShowYearPicker(true)}
              >
                <Text style={styles.yearSelectorText}>{currentDate.getFullYear()}</Text>
                <FontAwesome5 name="chevron-down" size={14} color="#0991f8" solid />
              </TouchableOpacity>

              <Calendar
                current={formatDate(currentDate)}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                maxDate={new Date().toISOString().split('T')[0]}
                theme={{
                  backgroundColor: '#fff',
                  calendarBackground: '#fff',
                  textSectionTitleColor: '#0991f8',
                  selectedDayBackgroundColor: '#0991f8',
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#0991f8',
                  dayTextColor: '#000',
                  textDisabledColor: '#ccc',
                  dotColor: '#0991f8',
                  selectedDotColor: '#fff',
                  monthTextColor: '#0991f8',
                  arrowColor: '#0991f8',
                  textDayFontFamily: 'Poppins-Regular',
                  textMonthFontFamily: 'Jua-Regular',
                  textDayHeaderFontFamily: 'Poppins-Regular',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                }}
              />

              <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                <Text style={styles.confirmButtonText}>CONFIRM</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.yearPickerTitle}>SELECT YEAR</Text>
              <ScrollView style={styles.yearList} showsVerticalScrollIndicator={false}>
                {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
                  .reverse()
                  .map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearOption,
                        currentDate.getFullYear() === year && styles.yearOptionSelected,
                      ]}
                      onPress={() => handleYearSelect(year)}
                    >
                      <Text
                        style={[
                          styles.yearOptionText,
                          currentDate.getFullYear() === year && styles.yearOptionTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowYearPicker(false)}
              >
                <FontAwesome5 name="arrow-left" size={16} color="#0991f8" solid />
                <Text style={styles.backButtonText}>BACK</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
  },
  yearSelectorText: {
    fontSize: 18,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    fontWeight: '600',
  },
  yearPickerTitle: {
    fontSize: 16,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
    textAlign: 'center',
    marginBottom: 12,
  },
  yearList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  yearOptionSelected: {
    backgroundColor: '#0991f8',
  },
  yearOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  yearOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#0991f8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Jua-Regular',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#0991f8',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Jua-Regular',
    color: '#0991f8',
  },
})
