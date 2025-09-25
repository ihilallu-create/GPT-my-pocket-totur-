import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function BookSession() {
  const { userData, appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;

  // Text content for all languages
  const texts = {
    title: {
      ar: "حجز الجلسات",
      en: "Book Sessions",
      ur: "سیشن بک کریں"
    },
    availableHours: {
      ar: "عدد الساعات المتاحة",
      en: "Available Hours",
      ur: "دستیاب گھنٹے"
    },
    groupSessions: {
      ar: "الحصص الجماعية",
      en: "Group Sessions",
      ur: "گروپ سیشنز"
    },
    individualSessions: {
      ar: "المواد الفردية",
      en: "Individual Sessions",
      ur: "انفرادی سیشنز"
    },
    availableSeats: {
      ar: "المقاعد المتاحة",
      en: "Available Seats",
      ur: "دستیاب نشستیں"
    },
    bookedSeats: {
      ar: "المقاعد المحجوزة",
      en: "Booked Seats",
      ur: "بک شدہ نشستیں"
    },
    discount: {
      ar: "نسبة الخصم",
      en: "Discount",
      ur: "رعایت"
    },
    expectedTime: {
      ar: "الوقت المتوقع للانتهاء",
      en: "Expected Completion Time",
      ur: "متوقع تکمیل کا وقت"
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
    hours: {
      ar: "ساعة",
      en: "hours",
      ur: "گھنٹے"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Student hours data
  const studentData = {
    availableHours: userData.studentName ? 12 : 12,
    totalHours: 30
  };

  // Group sessions data
  const groupSessions = [
    {
      id: 1,
      subject: {
        ar: "الرياضيات المتقدمة",
        en: "Advanced Mathematics",
        ur: "ایڈوانس ریاضی"
      },
      availableSeats: 3,
      bookedSeats: 7,
      totalSeats: 10,
      discount: 15,
      price: {
        ar: "120 ريال",
        en: "$30",
        ur: "120 ریال"
      },
      instructor: {
        ar: "د. أحمد محمد",
        en: "Dr. Ahmed Mohammed",
        ur: "ڈاکٹر احمد محمد"
      },
      time: {
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
      availableSeats: 2,
      bookedSeats: 6,
      totalSeats: 8,
      discount: 20,
      price: {
        ar: "100 ريال",
        en: "$25",
        ur: "100 ریال"
      },
      instructor: {
        ar: "د. سارة أحمد",
        en: "Dr. Sarah Ahmed",
        ur: "ڈاکٹر سارہ احمد"
      },
      time: {
        ar: "الأحد 4:00 م",
        en: "Sunday 4:00 PM",
        ur: "اتوار شام 4:00"
      }
    },
    {
      id: 3,
      subject: {
        ar: "الكيمياء العضوية",
        en: "Organic Chemistry",
        ur: "آرگینک کیمسٹری"
      },
      availableSeats: 1,
      bookedSeats: 4,
      totalSeats: 5,
      discount: 10,
      price: {
        ar: "90 ريال",
        en: "$22",
        ur: "90 ریال"
      },
      instructor: {
        ar: "د. محمد علي",
        en: "Dr. Mohammed Ali",
        ur: "ڈاکٹر محمد علی"
      },
      time: {
        ar: "الاثنين 6:00 م",
        en: "Monday 6:00 PM",
        ur: "پیر شام 6:00"
      }
    }
  ];

  // Individual sessions data
  const individualSessions = [
    {
      id: 1,
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
      },
      available: true
    },
    {
      id: 2,
      subject: {
        ar: "التفاضل والتكامل",
        en: "Calculus",
        ur: "کیلکولس"
      },
      expectedTime: 120,
      price: {
        ar: "250 ريال",
        en: "$60",
        ur: "250 ریال"
      },
      instructor: {
        ar: "أ. عبدالله سالم",
        en: "Mr. Abdullah Salem",
        ur: "جناب عبداللہ سالم"
      },
      available: true
    },
    {
      id: 3,
      subject: {
        ar: "الإحصاء التطبيقي",
        en: "Applied Statistics",
        ur: "اپلائیڈ شماریات"
      },
      expectedTime: 75,
      price: {
        ar: "180 ريال",
        en: "$45",
        ur: "180 ریال"
      },
      instructor: {
        ar: "د. منى خالد",
        en: "Dr. Mona Khalid",
        ur: "ڈاکٹر منیٰ خالد"
      },
      available: false
    }
  ];

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

        {/* Group Sessions */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.groupSessions[currentLanguage]}
          </Text>
          
          <View style={styles.sessionsGrid}>
            {groupSessions.map((session) => (
              <LinearGradient
                key={session.id}
                colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.sessionCard}
              >
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionSubject, { color: currentTheme.text }]}>
                    {session.subject[currentLanguage]}
                  </Text>
                  <View style={[styles.discountBadge, { backgroundColor: currentTheme.primary }]}>
                    <Text style={styles.discountText}>
                      {session.discount}% {texts.discount[currentLanguage]}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.sessionInstructor, { color: currentTheme.textSecondary }]}>
                  {session.instructor[currentLanguage]}
                </Text>
                
                <Text style={[styles.sessionTime, { color: currentTheme.primary }]}>
                  {session.time[currentLanguage]}
                </Text>
                
                <View style={styles.seatsInfo}>
                  <View style={styles.seatItem}>
                    <Text style={[styles.seatLabel, { color: currentTheme.textSecondary }]}>
                      {texts.availableSeats[currentLanguage]}
                    </Text>
                    <Text style={[styles.seatNumber, { color: '#10B981' }]}>
                      {session.availableSeats}
                    </Text>
                  </View>
                  
                  <View style={styles.seatItem}>
                    <Text style={[styles.seatLabel, { color: currentTheme.textSecondary }]}>
                      {texts.bookedSeats[currentLanguage]}
                    </Text>
                    <Text style={[styles.seatNumber, { color: '#EF4444' }]}>
                      {session.bookedSeats}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.bookButton, { backgroundColor: currentTheme.primary }]}
                  onPress={() => router.push(`/student/book-group-session?sessionId=${session.id}&subject=${session.subject[currentLanguage]}&instructor=${session.instructor[currentLanguage]}&time=${session.time[currentLanguage]}&available=${session.availableSeats}&booked=${session.bookedSeats}&total=${session.totalSeats}&discount=${session.discount}&price=${session.price[currentLanguage]}`)}
                >
                  <Text style={styles.bookButtonText}>
                    {texts.bookNow[currentLanguage]} - {session.price[currentLanguage]}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Individual Sessions */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.individualSessions[currentLanguage]}
          </Text>
          
          <View style={styles.sessionsGrid}>
            {individualSessions.map((session) => (
              <LinearGradient
                key={session.id}
                colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.sessionCard, { opacity: session.available ? 1 : 0.7 }]}
              >
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionSubject, { color: currentTheme.text }]}>
                    {session.subject[currentLanguage]}
                  </Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: session.available ? '#10B981' : '#EF4444' }
                  ]}>
                    <Text style={styles.statusText}>
                      {session.available ? 
                        (currentLanguage === 'ar' ? 'متاح' : currentLanguage === 'en' ? 'Available' : 'دستیاب') :
                        (currentLanguage === 'ar' ? 'غير متاح' : currentLanguage === 'en' ? 'Unavailable' : 'غیر دستیاب')
                      }
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.sessionInstructor, { color: currentTheme.textSecondary }]}>
                  {session.instructor[currentLanguage]}
                </Text>
                
                <View style={styles.timeInfo}>
                  <Text style={[styles.timeLabel, { color: currentTheme.textSecondary }]}>
                    {texts.expectedTime[currentLanguage]}
                  </Text>
                  <Text style={[styles.timeValue, { color: currentTheme.primary }]}>
                    {session.expectedTime} {texts.minutes[currentLanguage]}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.bookButton, 
                    { 
                      backgroundColor: session.available ? currentTheme.primary : currentTheme.border,
                      opacity: session.available ? 1 : 0.6
                    }
                  ]}
                  disabled={!session.available}
                  onPress={() => session.available && router.push(`/student/book-individual-session?sessionId=${session.id}&subject=${session.subject[currentLanguage]}&instructor=${session.instructor[currentLanguage]}&time=${session.expectedTime}&price=${session.price[currentLanguage]}`)}
                >
                  <Text style={[
                    styles.bookButtonText,
                    { color: session.available ? '#FFFFFF' : currentTheme.textSecondary }
                  ]}>
                    {session.available ? `${texts.bookNow[currentLanguage]} - ${session.price[currentLanguage]}` : 
                     (currentLanguage === 'ar' ? 'غير متاح حالياً' : currentLanguage === 'en' ? 'Currently Unavailable' : 'فی الوقت دستیاب نہیں')}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </View>
        </View>
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
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionsGrid: {
    gap: 16,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionSubject: {
    fontSize: 18,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionInstructor: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  seatsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  seatItem: {
    alignItems: 'center',
  },
  seatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  seatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});