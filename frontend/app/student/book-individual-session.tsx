import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function BookIndividualSession() {
  const { userData, appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;
  const params = useLocalSearchParams();

  // State for date and time selection
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Text content for all languages
  const texts = {
    title: {
      ar: "حجز جلسة فردية",
      en: "Book Individual Session",
      ur: "انفرادی سیشن بک کریں"
    },
    availableHours: {
      ar: "عدد الساعات المتاحة",
      en: "Available Hours",
      ur: "دستیاب گھنٹے"
    },
    sessionDetails: {
      ar: "تفاصيل الجلسة",
      en: "Session Details",
      ur: "سیشن کی تفصیلات"
    },
    instructor: {
      ar: "المدرس",
      en: "Instructor",
      ur: "استاد"
    },
    subject: {
      ar: "المادة",
      en: "Subject",
      ur: "مضمون"
    },
    expectedTime: {
      ar: "الوقت المتوقع",
      en: "Expected Duration",
      ur: "متوقع دورانیہ"
    },
    selectDateTime: {
      ar: "اختيار التاريخ والوقت",
      en: "Select Date & Time",
      ur: "تاریخ اور وقت منتخب کریں"
    },
    selectDate: {
      ar: "اختيار التاريخ",
      en: "Select Date",
      ur: "تاریخ منتخب کریں"
    },
    selectTime: {
      ar: "اختيار الوقت",
      en: "Select Time",
      ur: "وقت منتخب کریں"
    },
    confirmBooking: {
      ar: "تأكيد الحجز",
      en: "Confirm Booking",
      ur: "بکنگ کی تصدیق"
    },
    minutes: {
      ar: "دقيقة",
      en: "minutes",
      ur: "منٹ"
    },
    hours: {
      ar: "ساعة",
      en: "hours",
      ur: "گھنٹے"
    },
    cancel: {
      ar: "إلغاء",
      en: "Cancel",
      ur: "منسوخ"
    },
    done: {
      ar: "تم",
      en: "Done",
      ur: "مکمل"
    },
    pleaseSelectDateTime: {
      ar: "يرجى اختيار التاريخ والوقت",
      en: "Please select date and time",
      ur: "براہ کرم تاریخ اور وقت منتخب کریں"
    },
    bookingConfirmed: {
      ar: "تم تأكيد الحجز بنجاح",
      en: "Booking confirmed successfully",
      ur: "بکنگ کامیابی سے تصدیق ہوگئی"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Student hours data
  const studentData = {
    availableHours: userData.studentName ? 12 : 12,
    totalHours: 30
  };

  // Session data (normally would come from params or context)
  const sessionData = {
    id: params.sessionId || 1,
    subject: {
      ar: "الجبر الخطي",
      en: "Linear Algebra",
      ur: "لینیئر الجبرا"
    },
    expectedTime: 90,
    price: {
      ar: "200 ريال",
      en: "$50",
      ur: "200 ریال"
    },
    instructor: {
      ar: "أ. فاطمة الزهراء",
      en: "Ms. Fatima Alzahra",
      ur: "محترمہ فاطمہ الزہرا"
    }
  };

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = {
        ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
      };
      
      const monthNames = {
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        ur: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
      };
      
      const dayName = dayNames[currentLanguage][date.getDay()];
      const monthName = monthNames[currentLanguage][date.getMonth()];
      const day = date.getDate();
      
      dates.push({
        date: date.toISOString().split('T')[0],
        display: `${dayName} ${day} ${monthName}`,
        dayName,
        day,
        monthName
      });
    }
    
    return dates;
  };

  // Generate available times
  const generateAvailableTimes = () => {
    const times = [];
    const startHour = 9; // 9 AM
    const endHour = 21;  // 9 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        let display = '';
        if (currentLanguage === 'ar') {
          const hourDisplay = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const period = hour >= 12 ? 'م' : 'ص';
          display = `${hourDisplay}:${minute.toString().padStart(2, '0')} ${period}`;
        } else if (currentLanguage === 'en') {
          const hourDisplay = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const period = hour >= 12 ? 'PM' : 'AM';
          display = `${hourDisplay}:${minute.toString().padStart(2, '0')} ${period}`;
        } else { // Urdu
          const hourDisplay = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const period = hour >= 12 ? 'شام' : 'صبح';
          display = `${hourDisplay}:${minute.toString().padStart(2, '0')} ${period}`;
        }
        
        times.push({
          time: time24,
          display
        });
      }
    }
    
    return times;
  };

  const availableDates = generateAvailableDates();
  const availableTimes = generateAvailableTimes();

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert(
        currentLanguage === 'ar' ? 'تنبيه' : currentLanguage === 'en' ? 'Warning' : 'انتباہ',
        texts.pleaseSelectDateTime[currentLanguage]
      );
      return;
    }

    Alert.alert(
      currentLanguage === 'ar' ? 'تأكيد الحجز' : currentLanguage === 'en' ? 'Booking Confirmed' : 'بکنگ کی تصدیق',
      texts.bookingConfirmed[currentLanguage],
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const DatePickerModal = () => (
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={[styles.modalButton, { color: currentTheme.primary }]}>
                {texts.cancel[currentLanguage]}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              {texts.selectDate[currentLanguage]}
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={[styles.modalButton, { color: currentTheme.primary }]}>
                {texts.done[currentLanguage]}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.datesList}>
            {availableDates.map((dateItem) => (
              <TouchableOpacity
                key={dateItem.date}
                style={[
                  styles.dateItem,
                  { 
                    backgroundColor: selectedDate === dateItem.date ? currentTheme.primary + '20' : 'transparent',
                    borderColor: selectedDate === dateItem.date ? currentTheme.primary : currentTheme.border
                  }
                ]}
                onPress={() => setSelectedDate(dateItem.date)}
              >
                <Text style={[
                  styles.dateText,
                  { 
                    color: selectedDate === dateItem.date ? currentTheme.primary : currentTheme.text
                  }
                ]}>
                  {dateItem.display}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const TimePickerModal = () => (
    <Modal
      visible={showTimePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={[styles.modalButton, { color: currentTheme.primary }]}>
                {texts.cancel[currentLanguage]}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              {texts.selectTime[currentLanguage]}
            </Text>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={[styles.modalButton, { color: currentTheme.primary }]}>
                {texts.done[currentLanguage]}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.timesList}>
            <View style={styles.timesGrid}>
              {availableTimes.map((timeItem) => (
                <TouchableOpacity
                  key={timeItem.time}
                  style={[
                    styles.timeItem,
                    { 
                      backgroundColor: selectedTime === timeItem.time ? currentTheme.primary : currentTheme.background,
                      borderColor: selectedTime === timeItem.time ? currentTheme.primary : currentTheme.border
                    }
                  ]}
                  onPress={() => setSelectedTime(timeItem.time)}
                >
                  <Text style={[
                    styles.timeText,
                    { 
                      color: selectedTime === timeItem.time ? '#FFFFFF' : currentTheme.text
                    }
                  ]}>
                    {timeItem.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: currentTheme.surface }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backIcon, { color: currentTheme.text }]}>←</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
            {texts.title[currentLanguage]}
          </Text>

          <View style={styles.placeholder} />
        </LinearGradient>

        {/* Available Hours */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hoursCard}
        >
          <View style={styles.hoursInfo}>
            <Text style={[styles.hoursLabel, { color: currentTheme.textSecondary }]}>
              {texts.availableHours[currentLanguage]}
            </Text>
            <Text style={[styles.hoursNumber, { color: currentTheme.primary }]}>
              {studentData.availableHours}
            </Text>
            <View style={styles.hoursProgress}>
              <View style={[styles.progressBar, { backgroundColor: currentTheme.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: currentTheme.primary,
                      width: `${(studentData.availableHours / studentData.totalHours) * 100}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.hoursText, { color: currentTheme.textSecondary }]}>
                {studentData.availableHours} / {studentData.totalHours} {texts.hours[currentLanguage]}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Session Details */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.detailsCard}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.sessionDetails[currentLanguage]}
          </Text>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
              {texts.instructor[currentLanguage]}
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.text }]}>
              {sessionData.instructor[currentLanguage]}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
              {texts.subject[currentLanguage]}
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.text }]}>
              {sessionData.subject[currentLanguage]}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
              {texts.expectedTime[currentLanguage]}
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.primary }]}>
              {sessionData.expectedTime} {texts.minutes[currentLanguage]}
            </Text>
          </View>
        </LinearGradient>

        {/* DateTime Selection - Compact Version */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.compactSelectionCard}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.selectDateTime[currentLanguage]}
          </Text>
          
          <View style={styles.compactSelectionRow}>
            {/* Date Selection */}
            <TouchableOpacity
              style={[styles.compactSelectionButton, { borderColor: currentTheme.border, backgroundColor: selectedDate ? currentTheme.primary + '20' : currentTheme.background }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.compactSelectionIcon, { color: currentTheme.primary }]}>📅</Text>
              <View style={styles.compactSelectionContent}>
                <Text style={[styles.compactSelectionLabel, { color: currentTheme.textSecondary }]}>
                  {texts.selectDate[currentLanguage]}
                </Text>
                <Text style={[styles.compactSelectionValue, { color: selectedDate ? currentTheme.primary : currentTheme.textSecondary }]} numberOfLines={1}>
                  {selectedDate ? availableDates.find(d => d.date === selectedDate)?.display : 
                   (currentLanguage === 'ar' ? 'اختر التاريخ' : currentLanguage === 'en' ? 'Choose Date' : 'تاریخ منتخب کریں')}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Time Selection */}
            <TouchableOpacity
              style={[styles.compactSelectionButton, { borderColor: currentTheme.border, backgroundColor: selectedTime ? currentTheme.primary + '20' : currentTheme.background }]}
              onPress={() => selectedDate ? setShowTimePicker(true) : null}
              disabled={!selectedDate}
            >
              <Text style={[styles.compactSelectionIcon, { color: selectedDate ? currentTheme.primary : currentTheme.textSecondary }]}>🕒</Text>
              <View style={styles.compactSelectionContent}>
                <Text style={[styles.compactSelectionLabel, { color: currentTheme.textSecondary }]}>
                  {texts.selectTime[currentLanguage]}
                </Text>
                <Text style={[styles.compactSelectionValue, { color: selectedTime ? currentTheme.primary : currentTheme.textSecondary }]} numberOfLines={1}>
                  {selectedTime ? availableTimes.find(t => t.time === selectedTime)?.display : 
                   (currentLanguage === 'ar' ? 'اختر الوقت' : currentLanguage === 'en' ? 'Choose Time' : 'وقت منتخب کریں')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Progress Indicator */}
          <View style={styles.progressIndicator}>
            <View style={[styles.progressStep, { backgroundColor: selectedDate ? currentTheme.primary : currentTheme.border }]}>
              <Text style={[styles.progressStepText, { color: selectedDate ? '#FFFFFF' : currentTheme.textSecondary }]}>1</Text>
            </View>
            <View style={[styles.progressLine, { backgroundColor: selectedDate ? currentTheme.primary : currentTheme.border }]} />
            <View style={[styles.progressStep, { backgroundColor: selectedTime ? currentTheme.primary : currentTheme.border }]}>
              <Text style={[styles.progressStepText, { color: selectedTime ? '#FFFFFF' : currentTheme.textSecondary }]}>2</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: currentTheme.primary }]}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>
            {texts.confirmBooking[currentLanguage]} - {sessionData.price[currentLanguage]}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <DatePickerModal />
      <TimePickerModal />
    </SafeAreaView>
  );
}

// Theme system
const lightTheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#4F46E5',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#6366F1',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  hoursCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hoursInfo: {
    alignItems: 'center',
  },
  hoursLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  hoursNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hoursProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  hoursText: {
    fontSize: 14,
  },
  detailsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectionLabel: {
    fontSize: 14,
    flex: 1,
  },
  selectionValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 2,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  datesList: {
    paddingHorizontal: 20,
  },
  dateItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  timesList: {
    paddingHorizontal: 20,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeItem: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactSelectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  compactSelectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
    minHeight: 70,
  },
  compactSelectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compactSelectionContent: {
    flex: 1,
  },
  compactSelectionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  compactSelectionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
});