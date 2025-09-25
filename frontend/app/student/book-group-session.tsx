import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function BookGroupSession() {
  const { userData, appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;
  const params = useLocalSearchParams();

  // Text content for all languages
  const texts = {
    title: {
      ar: "حجز حصة جماعية",
      en: "Book Group Session",
      ur: "گروپ سیشن بک کریں"
    },
    sessionDetails: {
      ar: "تفاصيل الحصة",
      en: "Session Details",
      ur: "سیشن کی تفصیلات"
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
    sessionTime: {
      ar: "موعد الحصة",
      en: "Session Time",
      ur: "سیشن کا وقت"
    },
    seatsInfo: {
      ar: "معلومات المقاعد",
      en: "Seats Information",
      ur: "نشستوں کی معلومات"
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
    remainingSeats: {
      ar: "المقاعد المتبقية",
      en: "Remaining Seats",
      ur: "باقی نشستیں"
    },
    totalSeats: {
      ar: "إجمالي المقاعد",
      en: "Total Seats",
      ur: "کل نشستیں"
    },
    discount: {
      ar: "نسبة الخصم",
      en: "Discount",
      ur: "رعایت"
    },
    expectedDuration: {
      ar: "الوقت المتوقع لإنهاء المادة",
      en: "Expected Completion Time",
      ur: "متوقع تکمیل کا وقت"
    },
    originalPrice: {
      ar: "السعر الأصلي",
      en: "Original Price",
      ur: "اصل قیمت"
    },
    discountedPrice: {
      ar: "السعر بعد الخصم",
      en: "Discounted Price",
      ur: "رعایت کے بعد قیمت"
    },
    confirmBooking: {
      ar: "تأكيد الحجز",
      en: "Confirm Booking",
      ur: "بکنگ کی تصدیق"
    },
    bookingConfirmed: {
      ar: "تم تأكيد الحجز بنجاح",
      en: "Booking confirmed successfully",
      ur: "بکنگ کامیابی سے تصدیق ہوگئی"
    },
    seatsAlmostFull: {
      ar: "تنبيه: المقاعد على وشك الامتلاء!",
      en: "Warning: Seats are almost full!",
      ur: "انتباہ: نشستیں تقریباً بھر گئی ہیں!"
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
    youSave: {
      ar: "توفر",
      en: "You Save",
      ur: "آپ کی بچت"
    },
    sessionFull: {
      ar: "الحصة ممتلئة",
      en: "Session Full",
      ur: "سیشن بھرا ہوا"
    },
    waitingList: {
      ar: "قائمة الانتظار",
      en: "Join Waiting List",
      ur: "انتظار کی فہرست میں شامل ہوں"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Session data (normally would come from params or API)
  const sessionData = {
    id: params.sessionId || 1,
    subject: {
      ar: params.subject || "الرياضيات المتقدمة",
      en: params.subject || "Advanced Mathematics",
      ur: params.subject || "ایڈوانس ریاضی"
    },
    instructor: {
      ar: params.instructor || "د. أحمد محمد",
      en: params.instructor || "Dr. Ahmed Mohammed",
      ur: params.instructor || "ڈاکٹر احمد محمد"
    },
    time: {
      ar: params.time || "السبت 2:00 م",
      en: params.time || "Saturday 2:00 PM",
      ur: params.time || "ہفتہ دوپہر 2:00"
    },
    availableSeats: parseInt(params.available) || 3,
    bookedSeats: parseInt(params.booked) || 7,
    totalSeats: parseInt(params.total) || 10,
    discount: parseInt(params.discount) || 15,
    originalPrice: {
      ar: "140 ريال",
      en: "$35",
      ur: "140 ریال"
    },
    discountedPrice: {
      ar: params.price || "120 ريال",
      en: params.price || "$30",
      ur: params.price || "120 ریال"
    },
    expectedDuration: 120, // minutes
    category: "group"
  };

  const remainingSeats = sessionData.availableSeats;
  const seatsFillPercentage = (sessionData.bookedSeats / sessionData.totalSeats) * 100;
  const isAlmostFull = seatsFillPercentage >= 70;
  const isFull = remainingSeats === 0;

  // Calculate savings
  const getSavingsAmount = () => {
    if (currentLanguage === 'ar') {
      return `${sessionData.discount * 140 / 100} ريال`;
    } else if (currentLanguage === 'en') {
      return `$${(sessionData.discount * 35 / 100).toFixed(0)}`;
    } else {
      return `${sessionData.discount * 140 / 100} ریال`;
    }
  };

  const handleConfirmBooking = () => {
    if (isFull) {
      Alert.alert(
        currentLanguage === 'ar' ? 'الحصة ممتلئة' : currentLanguage === 'en' ? 'Session Full' : 'سیشن بھرا ہوا',
        currentLanguage === 'ar' ? 'هل تريد الانضمام لقائمة الانتظار؟' : 
        currentLanguage === 'en' ? 'Would you like to join the waiting list?' : 
        'کیا آپ انتظار کی فہرست میں شامل ہونا چاہتے ہیں؟',
        [
          { text: currentLanguage === 'ar' ? 'لا' : currentLanguage === 'en' ? 'No' : 'نہیں', style: 'cancel' },
          { text: currentLanguage === 'ar' ? 'نعم' : currentLanguage === 'en' ? 'Yes' : 'جی ہاں', onPress: () => router.back() }
        ]
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

        {/* Alert for almost full session */}
        {isAlmostFull && !isFull && (
          <View style={[styles.warningCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Text style={[styles.warningText, { color: '#92400E' }]}>
              ⚠️ {texts.seatsAlmostFull[currentLanguage]}
            </Text>
          </View>
        )}

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
              {texts.subject[currentLanguage]}
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.text }]}>
              {sessionData.subject[currentLanguage]}
            </Text>
          </View>
          
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
              {texts.sessionTime[currentLanguage]}
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.primary }]}>
              {sessionData.time[currentLanguage]}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: currentTheme.textSecondary }]}>
              {texts.expectedDuration[currentLanguage]}
            </Text>
            <Text style={[styles.detailValue, { color: currentTheme.primary }]}>
              {sessionData.expectedDuration} {texts.minutes[currentLanguage]}
            </Text>
          </View>
        </LinearGradient>

        {/* Seats Information */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.seatsCard}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {texts.seatsInfo[currentLanguage]}
          </Text>
          
          {/* Seats Progress Bar */}
          <View style={styles.seatsProgress}>
            <View style={[styles.progressBarContainer, { backgroundColor: currentTheme.border }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    backgroundColor: isFull ? '#EF4444' : isAlmostFull ? '#F59E0B' : '#10B981',
                    width: `${seatsFillPercentage}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: currentTheme.textSecondary }]}>
              {sessionData.bookedSeats} / {sessionData.totalSeats} {currentLanguage === 'ar' ? 'محجوز' : currentLanguage === 'en' ? 'booked' : 'بک شدہ'}
            </Text>
          </View>
          
          {/* Seats Grid */}
          <View style={styles.seatsGrid}>
            <View style={styles.seatItem}>
              <Text style={[styles.seatNumber, { color: '#10B981' }]}>
                {remainingSeats}
              </Text>
              <Text style={[styles.seatLabel, { color: currentTheme.textSecondary }]}>
                {texts.remainingSeats[currentLanguage]}
              </Text>
            </View>
            
            <View style={styles.seatItem}>
              <Text style={[styles.seatNumber, { color: '#EF4444' }]}>
                {sessionData.bookedSeats}
              </Text>
              <Text style={[styles.seatLabel, { color: currentTheme.textSecondary }]}>
                {texts.bookedSeats[currentLanguage]}
              </Text>
            </View>
            
            <View style={styles.seatItem}>
              <Text style={[styles.seatNumber, { color: '#6B7280' }]}>
                {sessionData.totalSeats}
              </Text>
              <Text style={[styles.seatLabel, { color: currentTheme.textSecondary }]}>
                {texts.totalSeats[currentLanguage]}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pricing & Discount */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.pricingCard}
        >
          <View style={styles.discountHeader}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {texts.discount[currentLanguage]}
            </Text>
            <View style={[styles.discountBadge, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.discountText}>
                {sessionData.discount}%
              </Text>
            </View>
          </View>
          
          <View style={styles.pricingDetails}>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: currentTheme.textSecondary }]}>
                {texts.originalPrice[currentLanguage]}
              </Text>
              <Text style={[styles.originalPriceText, { color: currentTheme.textSecondary }]}>
                {sessionData.originalPrice[currentLanguage]}
              </Text>
            </View>
            
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, { color: currentTheme.textSecondary }]}>
                {texts.discountedPrice[currentLanguage]}
              </Text>
              <Text style={[styles.discountedPriceText, { color: currentTheme.primary }]}>
                {sessionData.discountedPrice[currentLanguage]}
              </Text>
            </View>
            
            <View style={styles.savingsItem}>
              <Text style={[styles.savingsText, { color: '#10B981' }]}>
                {texts.youSave[currentLanguage]}: {getSavingsAmount()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton, 
            { 
              backgroundColor: isFull ? currentTheme.border : currentTheme.primary,
              opacity: isFull ? 0.7 : 1
            }
          ]}
          onPress={handleConfirmBooking}
        >
          <Text style={[
            styles.confirmButtonText,
            { color: isFull ? currentTheme.textSecondary : '#FFFFFF' }
          ]}>
            {isFull ? texts.waitingList[currentLanguage] : 
             `${texts.confirmBooking[currentLanguage]} - ${sessionData.discountedPrice[currentLanguage]}`}
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
  warningCard: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  seatsCard: {
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
  pricingCard: {
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
  seatsProgress: {
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  seatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seatItem: {
    alignItems: 'center',
  },
  seatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  seatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pricingDetails: {
    gap: 12,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
  },
  originalPriceText: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  discountedPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingsItem: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '700',
  },
});