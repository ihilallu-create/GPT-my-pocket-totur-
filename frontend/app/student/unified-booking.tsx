import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function UnifiedBooking() {
  const { userData, appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;

  // State management
  const [selectedSessionType, setSelectedSessionType] = useState('individual');
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Text content for all languages
  const texts = {
    title: {
      ar: "حجز جلسة",
      en: "Book Session", 
      ur: "سیشن بک کریں"
    },
    availableHours: {
      ar: "عدد الساعات المتاحة",
      en: "Available Hours",
      ur: "دستیاب گھنٹے"
    },
    sessionType: {
      ar: "نوع الجلسة",
      en: "Session Type",
      ur: "سیشن کی قسم"
    },
    individual: {
      ar: "فردية",
      en: "Individual",
      ur: "انفرادی"
    },
    group: {
      ar: "جماعية",
      en: "Group", 
      ur: "گروپ"
    },
    availableSessions: {
      ar: "الجلسات المتاحة",
      en: "Available Sessions",
      ur: "دستیاب سیشنز"
    },
    subject: {
      ar: "المادة",
      en: "Subject",
      ur: "مضمون"
    },
    instructor: {
      ar: "المدرس",
      en: "Instructor", 
      ur: "استاد"
    },
    duration: {
      ar: "المدة",
      en: "Duration",
      ur: "مدت"
    },
    price: {
      ar: "السعر",
      en: "Price",
      ur: "قیمت"
    },
    availableSeats: {
      ar: "المقاعد المتاحة",
      en: "Available Seats",
      ur: "دستیاب نشستیں"
    },
    discount: {
      ar: "خصم",
      en: "Discount",
      ur: "رعایت"
    },
    dateTime: {
      ar: "التاريخ والوقت",
      en: "Date & Time",
      ur: "تاریخ اور وقت"
    },
    selectDate: {
      ar: "اختر التاريخ",
      en: "Select Date",
      ur: "تاریخ منتخب کریں"
    },
    selectTime: {
      ar: "اختر الوقت", 
      en: "Select Time",
      ur: "وقت منتخب کریں"
    },
    specialRequests: {
      ar: "طلبات خاصة",
      en: "Special Requests",
      ur: "خصوصی درخواست"
    },
    requestsPlaceholder: {
      ar: "أي متطلبات أو ملاحظات خاصة...",
      en: "Any special requirements or notes...",
      ur: "کوئی خاص ضروریات یا نوٹس..."
    },
    bookNow: {
      ar: "احجز الآن",
      en: "Book Now",
      ur: "ابھی بک کریں"
    },
    minutes: {
      ar: "دقيقة",
      en: "minutes",
      ur: "منٹ"
    },
    bookingConfirmed: {
      ar: "تم تأكيد الحجز بنجاح",
      en: "Booking confirmed successfully",
      ur: "بکنگ کامیابی سے تصدیق ہوگئی"
    }
  };

  // Student data
  const studentData = {
    availableHours: 12,
    totalHours: 30
  };

  // Sessions data
  const individualSessions = [
    {
      id: 1,
      subject: {
        ar: "الجبر الخطي",
        en: "Linear Algebra",
        ur: "لینیئر الجبرا"
      },
      instructor: {
        ar: "أ. فاطمة الزهراء",
        en: "Ms. Fatima Alzahra",
        ur: "محترمہ فاطمہ الزہرا"
      },
      duration: 90,
      price: {
        ar: "200 ريال",
        en: "$50",
        ur: "200 ریال"
      }
    },
    {
      id: 2,
      subject: {
        ar: "التفاضل والتكامل",
        en: "Calculus",
        ur: "کیلکولس"
      },
      instructor: {
        ar: "د. أحمد محمد",
        en: "Dr. Ahmed Mohammed", 
        ur: "ڈاکٹر احمد محمد"
      },
      duration: 120,
      price: {
        ar: "250 ريال",
        en: "$60",
        ur: "250 ریال"
      }
    }
  ];

  const groupSessions = [
    {
      id: 1,
      subject: {
        ar: "الرياضيات المتقدمة",
        en: "Advanced Mathematics",
        ur: "ایڈوانس ریاضی"
      },
      instructor: {
        ar: "د. سارة أحمد",
        en: "Dr. Sarah Ahmed",
        ur: "ڈاکٹر سارہ احمد"
      },
      duration: 120,
      price: {
        ar: "120 ريال",
        en: "$30",
        ur: "120 ریال"
      },
      availableSeats: 3,
      totalSeats: 10,
      discount: 15,
      scheduledTime: {
        ar: "السبت 2:00 م",
        en: "Saturday 2:00 PM",
        ur: "ہفتہ دوپہر 2:00"
      }
    },
    {
      id: 2,
      subject: {
        ar: "الفيزياء التطبيقية",
        en: "Applied Physics",
        ur: "اپلائیڈ فزکس"
      },
      instructor: {
        ar: "د. محمد علي",
        en: "Dr. Mohammed Ali",
        ur: "ڈاکٹر محمد علی"
      },
      duration: 90,
      price: {
        ar: "100 ريال",
        en: "$25",
        ur: "100 ریال"
      },
      availableSeats: 2,
      totalSeats: 8,
      discount: 20,
      scheduledTime: {
        ar: "الأحد 4:00 م",
        en: "Sunday 4:00 PM",
        ur: "اتوار شام 4:00"
      }
    }
  ];

  // Available dates (next 7 days)
  const availableDates = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayNames = {
      ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
    };
    const dayName = dayNames[currentLanguage][date.getDay()];
    const day = date.getDate();
    availableDates.push({
      date: date.toISOString().split('T')[0],
      display: `${dayName} ${day}`,
      dayName,
      day
    });
  }

  // Available times
  const availableTimes = [
    { time: '09:00', display: currentLanguage === 'ar' ? '9:00 ص' : '9:00 AM' },
    { time: '10:00', display: currentLanguage === 'ar' ? '10:00 ص' : '10:00 AM' },
    { time: '11:00', display: currentLanguage === 'ar' ? '11:00 ص' : '11:00 AM' },
    { time: '14:00', display: currentLanguage === 'ar' ? '2:00 م' : '2:00 PM' },
    { time: '15:00', display: currentLanguage === 'ar' ? '3:00 م' : '3:00 PM' },
    { time: '16:00', display: currentLanguage === 'ar' ? '4:00 م' : '4:00 PM' },
    { time: '17:00', display: currentLanguage === 'ar' ? '5:00 م' : '5:00 PM' },
    { time: '18:00', display: currentLanguage === 'ar' ? '6:00 م' : '6:00 PM' },
  ];

  const currentSessions = selectedSessionType === 'individual' ? individualSessions : groupSessions;

  const handleBookSession = () => {
    if (!selectedSession) {
      Alert.alert(
        currentLanguage === 'ar' ? 'تنبيه' : 'Warning',
        currentLanguage === 'ar' ? 'يرجى اختيار جلسة' : 'Please select a session'
      );
      return;
    }

    if (selectedSessionType === 'individual' && (!selectedDate || !selectedTime)) {
      Alert.alert(
        currentLanguage === 'ar' ? 'تنبيه' : 'Warning',
        currentLanguage === 'ar' ? 'يرجى اختيار التاريخ والوقت' : 'Please select date and time'
      );
      return;
    }

    Alert.alert(
      currentLanguage === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmed',
      texts.bookingConfirmed[currentLanguage],
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Available Hours */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hoursCard}
        >
          <View style={styles.hoursInfo}>
            <Text style={[styles.hoursNumber, { color: currentTheme.primary }]}>
              {studentData.availableHours}
            </Text>
            <Text style={[styles.hoursLabel, { color: currentTheme.textSecondary }]}>
              {texts.availableHours[currentLanguage]}
            </Text>
          </View>
        </LinearGradient>

        {/* Session Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.sessionType[currentLanguage]}
          </Text>
          
          <View style={styles.sessionTypeContainer}>
            <TouchableOpacity
              style={[
                styles.sessionTypeButton,
                { 
                  backgroundColor: selectedSessionType === 'individual' ? currentTheme.primary : currentTheme.surface,
                  borderColor: selectedSessionType === 'individual' ? currentTheme.primary : currentTheme.border
                }
              ]}
              onPress={() => {
                setSelectedSessionType('individual');
                setSelectedSession(null);
              }}
            >
              <Text style={[
                styles.sessionTypeText,
                { color: selectedSessionType === 'individual' ? '#FFFFFF' : currentTheme.text }
              ]}>
                {texts.individual[currentLanguage]}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sessionTypeButton,
                { 
                  backgroundColor: selectedSessionType === 'group' ? currentTheme.primary : currentTheme.surface,
                  borderColor: selectedSessionType === 'group' ? currentTheme.primary : currentTheme.border
                }
              ]}
              onPress={() => {
                setSelectedSessionType('group');
                setSelectedSession(null);
              }}
            >
              <Text style={[
                styles.sessionTypeText,
                { color: selectedSessionType === 'group' ? '#FFFFFF' : currentTheme.text }
              ]}>
                {texts.group[currentLanguage]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.availableSessions[currentLanguage]}
          </Text>
          
          {currentSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                { 
                  backgroundColor: selectedSession?.id === session.id ? currentTheme.primary + '20' : currentTheme.surface,
                  borderColor: selectedSession?.id === session.id ? currentTheme.primary : currentTheme.border
                }
              ]}
              onPress={() => setSelectedSession(session)}
            >
              <View style={styles.sessionHeader}>
                <Text style={[styles.sessionSubject, { color: currentTheme.text }]}>
                  {session.subject[currentLanguage]}
                </Text>
                {selectedSessionType === 'group' && (
                  <View style={[styles.discountBadge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.discountText}>
                      {session.discount}% {texts.discount[currentLanguage]}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.sessionInstructor, { color: currentTheme.textSecondary }]}>
                {session.instructor[currentLanguage]}
              </Text>
              
              <View style={styles.sessionDetails}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
                    {texts.duration[currentLanguage]}
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.primary }]}>
                    {session.duration} {texts.minutes[currentLanguage]}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
                    {texts.price[currentLanguage]}
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.primary }]}>
                    {session.price[currentLanguage]}
                  </Text>
                </View>
                
                {selectedSessionType === 'group' && (
                  <>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
                        {texts.availableSeats[currentLanguage]}
                      </Text>
                      <Text style={[styles.detailValue, { color: '#10B981' }]}>
                        {session.availableSeats}/{session.totalSeats}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
                        {texts.dateTime[currentLanguage]}
                      </Text>
                      <Text style={[styles.detailValue, { color: currentTheme.text }]}>
                        {session.scheduledTime[currentLanguage]}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date & Time Selection for Individual Sessions */}
        {selectedSessionType === 'individual' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {texts.dateTime[currentLanguage]}
            </Text>
            
            {/* Date Selection */}
            <Text style={[styles.subsectionTitle, { color: currentTheme.textSecondary }]}>
              {texts.selectDate[currentLanguage]}
            </Text>
            <View style={styles.dateContainer}>
              {availableDates.map((dateItem) => (
                <TouchableOpacity
                  key={dateItem.date}
                  style={[
                    styles.dateButton,
                    { 
                      backgroundColor: selectedDate === dateItem.date ? currentTheme.primary : currentTheme.surface,
                      borderColor: selectedDate === dateItem.date ? currentTheme.primary : currentTheme.border
                    }
                  ]}
                  onPress={() => setSelectedDate(dateItem.date)}
                >
                  <Text style={[
                    styles.dateText,
                    { color: selectedDate === dateItem.date ? '#FFFFFF' : currentTheme.text }
                  ]}>
                    {dateItem.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Time Selection */}
            <Text style={[styles.subsectionTitle, { color: currentTheme.textSecondary, marginTop: 20 }]}>
              {texts.selectTime[currentLanguage]}
            </Text>
            <View style={styles.timeContainer}>
              {availableTimes.map((timeItem) => (
                <TouchableOpacity
                  key={timeItem.time}
                  style={[
                    styles.timeButton,
                    { 
                      backgroundColor: selectedTime === timeItem.time ? currentTheme.primary : currentTheme.surface,
                      borderColor: selectedTime === timeItem.time ? currentTheme.primary : currentTheme.border
                    }
                  ]}
                  onPress={() => setSelectedTime(timeItem.time)}
                >
                  <Text style={[
                    styles.timeText,
                    { color: selectedTime === timeItem.time ? '#FFFFFF' : currentTheme.text }
                  ]}>
                    {timeItem.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.specialRequests[currentLanguage]}
          </Text>
          
          <TextInput
            style={[
              styles.requestsInput,
              { 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
                color: currentTheme.text
              }
            ]}
            placeholder={texts.requestsPlaceholder[currentLanguage]}
            placeholderTextColor={currentTheme.textSecondary}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: currentTheme.primary }]}
          onPress={handleBookSession}
        >
          <Text style={styles.bookButtonText}>
            {texts.bookNow[currentLanguage]}
            {selectedSession && ` - ${selectedSession.price[currentLanguage]}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  hoursCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  hoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  hoursNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  hoursLabel: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  sessionTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionInstructor: {
    fontSize: 14,
    marginBottom: 12,
  },
  sessionDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requestsInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
  },
  bookButton: {
    marginHorizontal: 20,
    marginVertical: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});