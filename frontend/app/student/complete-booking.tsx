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
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function CompleteBooking() {
  const { userData, appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;
  const params = useLocalSearchParams();

  // State management
  const [sessionType, setSessionType] = useState('individual');
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Text content for all languages
  const texts = {
    title: {
      ar: "حجز جلسة شامل",
      en: "Complete Session Booking",
      ur: "مکمل سیشن بکنگ"
    },
    sessionType: {
      ar: "نوع الجلسة",
      en: "Session Type",
      ur: "سیشن کی قسم"
    },
    individualSession: {
      ar: "جلسة فردية",
      en: "Individual Session",
      ur: "انفرادی سیشن"
    },
    groupSession: {
      ar: "جلسة جماعية",
      en: "Group Session",
      ur: "گروپ سیشن"
    },
    next: {
      ar: "التالي",
      en: "Next",
      ur: "اگلا"
    },
    previous: {
      ar: "السابق",
      en: "Previous",
      ur: "پچھلا"
    },
    availableHours: {
      ar: "عدد الساعات المتاحة",
      en: "Available Hours",
      ur: "دستیاب گھنٹے"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

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
      },
      description: {
        ar: "دروس متقدمة في الجبر الخطي مع التطبيقات العملية",
        en: "Advanced Linear Algebra lessons with practical applications",
        ur: "عملی اطلاق کے ساتھ ایڈوانس لینیئر الجبرا کے اسباق"
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
      },
      description: {
        ar: "مبادئ التفاضل والتكامل مع حل المسائل التطبيقية",
        en: "Calculus fundamentals with applied problem solving",
        ur: "عملی مسائل حل کرنے کے ساتھ کیلکولس کی بنیادی باتیں"
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
      },
      description: {
        ar: "جلسة جماعية تفاعلية في الرياضيات المتقدمة",
        en: "Interactive group session in Advanced Mathematics",
        ur: "ایڈوانس ریاضی میں انٹرایکٹو گروپ سیشن"
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
      },
      description: {
        ar: "تطبيقات عملية في الفيزياء مع التجارب العملية",
        en: "Practical Physics applications with hands-on experiments",
        ur: "عملی تجربات کے ساتھ فزکس کے عملی اطلاقات"
      }
    }
  ];

  // Generate available dates
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = {
        ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
      };
      
      const monthNames = {
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ur: ['جن', 'فر', 'مار', 'اپر', 'مئی', 'جون', 'جول', 'اگ', 'ست', 'اکت', 'نو', 'دس']
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
    const startHour = 9;
    const endHour = 20;
    
    for (let hour = startHour; hour <= endHour; hour++) {
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
        } else {
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

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = () => {
    if (sessionType === 'group') {
      // For group sessions, use scheduled time
      const groupSession = groupSessions.find(s => s.id === selectedSession.id);
      setSelectedTime(groupSession.scheduledTime[currentLanguage]);
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  };

  const handleConfirmBooking = () => {
    Alert.alert(
      texts.bookingSuccess[currentLanguage],
      `${texts.subject[currentLanguage]}: ${selectedSession.subject[currentLanguage]}\n${texts.instructor[currentLanguage]}: ${selectedSession.instructor[currentLanguage]}\n${texts.dateTime[currentLanguage]}: ${selectedDate ? availableDates.find(d => d.date === selectedDate)?.display : ''} ${selectedTime}`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const renderSessionTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: currentTheme.text }]}>
        {texts.sessionType[currentLanguage]}
      </Text>
      
      <View style={styles.sessionTypeContainer}>
        <TouchableOpacity
          style={[
            styles.sessionTypeCard,
            { 
              backgroundColor: sessionType === 'individual' ? currentTheme.primary + '20' : currentTheme.surface,
              borderColor: sessionType === 'individual' ? currentTheme.primary : currentTheme.border
            }
          ]}
          onPress={() => setSessionType('individual')}
        >
          <Text style={[styles.sessionTypeIcon, { color: currentTheme.primary }]}>👤</Text>
          <Text style={[styles.sessionTypeTitle, { color: currentTheme.text }]}>
            {texts.individualSession[currentLanguage]}
          </Text>
          <Text style={[styles.sessionTypeDesc, { color: currentTheme.textSecondary }]}>
            {currentLanguage === 'ar' ? 'جلسة فردية مخصصة' : 
             currentLanguage === 'en' ? 'Personalized one-on-one' : 'ذاتی ون آن ون'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sessionTypeCard,
            { 
              backgroundColor: sessionType === 'group' ? currentTheme.primary + '20' : currentTheme.surface,
              borderColor: sessionType === 'group' ? currentTheme.primary : currentTheme.border
            }
          ]}
          onPress={() => setSessionType('group')}
        >
          <Text style={[styles.sessionTypeIcon, { color: currentTheme.primary }]}>👥</Text>
          <Text style={[styles.sessionTypeTitle, { color: currentTheme.text }]}>
            {texts.groupSession[currentLanguage]}
          </Text>
          <Text style={[styles.sessionTypeDesc, { color: currentTheme.textSecondary }]}>
            {currentLanguage === 'ar' ? 'جلسة جماعية تفاعلية' : 
             currentLanguage === 'en' ? 'Interactive group learning' : 'انٹرایکٹو گروپ لرننگ'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: currentTheme.primary }]}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.nextButtonText}>
          {texts.next[currentLanguage]}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSessionSelection = () => {
    const sessions = sessionType === 'individual' ? individualSessions : groupSessions;
    
    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: currentTheme.text }]}>
          {texts.sessionDetails[currentLanguage]}
        </Text>
        
        <View style={styles.sessionsContainer}>
          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                { 
                  backgroundColor: selectedSession?.id === session.id ? currentTheme.primary + '20' : currentTheme.surface,
                  borderColor: selectedSession?.id === session.id ? currentTheme.primary : currentTheme.border
                }
              ]}
              onPress={() => handleSessionSelect(session)}
            >
              <View style={styles.sessionHeader}>
                <Text style={[styles.sessionSubject, { color: currentTheme.text }]}>
                  {session.subject[currentLanguage]}
                </Text>
                {sessionType === 'group' && (
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
              
              <Text style={[styles.sessionDescription, { color: currentTheme.textSecondary }]}>
                {session.description[currentLanguage]}
              </Text>
              
              <View style={styles.sessionInfo}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>
                    {texts.duration[currentLanguage]}
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.primary }]}>
                    {session.duration} {texts.minutes[currentLanguage]}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>
                    {texts.price[currentLanguage]}
                  </Text>
                  <Text style={[styles.infoValue, { color: currentTheme.primary }]}>
                    {session.price[currentLanguage]}
                  </Text>
                </View>
                
                {sessionType === 'group' && (
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: currentTheme.textSecondary }]}>
                      {texts.availableSeats[currentLanguage]}
                    </Text>
                    <Text style={[styles.infoValue, { color: '#10B981' }]}>
                      {session.availableSeats}/{session.totalSeats}
                    </Text>
                  </View>
                )}
              </View>
              
              {sessionType === 'group' && (
                <Text style={[styles.scheduledTime, { color: currentTheme.primary }]}>
                  {session.scheduledTime[currentLanguage]}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: currentTheme.border }]}
            onPress={() => setCurrentStep(1)}
          >
            <Text style={[styles.navButtonText, { color: currentTheme.text }]}>
              {texts.previous[currentLanguage]}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.navButton, 
              { 
                backgroundColor: selectedSession ? currentTheme.primary : currentTheme.border,
                opacity: selectedSession ? 1 : 0.6
              }
            ]}
            disabled={!selectedSession}
            onPress={handleDateTimeSelect}
          >
            <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
              {texts.next[currentLanguage]}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDateTimeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: currentTheme.text }]}>
        {texts.dateTime[currentLanguage]}
      </Text>
      
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={[
            styles.dateTimeButton,
            { 
              backgroundColor: selectedDate ? currentTheme.primary + '20' : currentTheme.surface,
              borderColor: selectedDate ? currentTheme.primary : currentTheme.border
            }
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateTimeIcon, { color: currentTheme.primary }]}>📅</Text>
          <Text style={[styles.dateTimeLabel, { color: currentTheme.textSecondary }]}>
            {texts.selectDate[currentLanguage]}
          </Text>
          <Text style={[styles.dateTimeValue, { color: currentTheme.text }]}>
            {selectedDate ? availableDates.find(d => d.date === selectedDate)?.display : 
             (currentLanguage === 'ar' ? 'اختر التاريخ' : currentLanguage === 'en' ? 'Choose Date' : 'تاریخ منتخب کریں')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.dateTimeButton,
            { 
              backgroundColor: selectedTime ? currentTheme.primary + '20' : currentTheme.surface,
              borderColor: selectedTime ? currentTheme.primary : currentTheme.border,
              opacity: selectedDate ? 1 : 0.6
            }
          ]}
          disabled={!selectedDate}
          onPress={() => selectedDate && setShowTimePicker(true)}
        >
          <Text style={[styles.dateTimeIcon, { color: selectedDate ? currentTheme.primary : currentTheme.textSecondary }]}>🕒</Text>
          <Text style={[styles.dateTimeLabel, { color: currentTheme.textSecondary }]}>
            {texts.selectTime[currentLanguage]}
          </Text>
          <Text style={[styles.dateTimeValue, { color: currentTheme.text }]}>
            {selectedTime ? availableTimes.find(t => t.time === selectedTime)?.display : 
             (currentLanguage === 'ar' ? 'اختر الوقت' : currentLanguage === 'en' ? 'Choose Time' : 'وقت منتخب کریں')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: currentTheme.border }]}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={[styles.navButtonText, { color: currentTheme.text }]}>
            {texts.previous[currentLanguage]}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            { 
              backgroundColor: (selectedDate && selectedTime) ? currentTheme.primary : currentTheme.border,
              opacity: (selectedDate && selectedTime) ? 1 : 0.6
            }
          ]}
          disabled={!(selectedDate && selectedTime)}
          onPress={() => setCurrentStep(4)}
        >
          <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
            {texts.next[currentLanguage]}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: currentTheme.text }]}>
        {texts.bookingConfirmation[currentLanguage]}
      </Text>
      
      <LinearGradient
        colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.confirmationCard}
      >
        <Text style={[styles.confirmationSubject, { color: currentTheme.text }]}>
          {selectedSession?.subject[currentLanguage]}
        </Text>
        
        <Text style={[styles.confirmationInstructor, { color: currentTheme.textSecondary }]}>
          {selectedSession?.instructor[currentLanguage]}
        </Text>
        
        <View style={styles.confirmationDetails}>
          <View style={styles.confirmationRow}>
            <Text style={[styles.confirmationLabel, { color: currentTheme.textSecondary }]}>
              {texts.sessionType[currentLanguage]}:
            </Text>
            <Text style={[styles.confirmationValue, { color: currentTheme.text }]}>
              {sessionType === 'individual' ? texts.individualSession[currentLanguage] : texts.groupSession[currentLanguage]}
            </Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Text style={[styles.confirmationLabel, { color: currentTheme.textSecondary }]}>
              {texts.dateTime[currentLanguage]}:
            </Text>
            <Text style={[styles.confirmationValue, { color: currentTheme.text }]}>
              {sessionType === 'group' ? 
                groupSessions.find(s => s.id === selectedSession?.id)?.scheduledTime[currentLanguage] :
                `${selectedDate ? availableDates.find(d => d.date === selectedDate)?.display : ''} ${selectedTime ? availableTimes.find(t => t.time === selectedTime)?.display : ''}`
              }
            </Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Text style={[styles.confirmationLabel, { color: currentTheme.textSecondary }]}>
              {texts.duration[currentLanguage]}:
            </Text>
            <Text style={[styles.confirmationValue, { color: currentTheme.text }]}>
              {selectedSession?.duration} {texts.minutes[currentLanguage]}
            </Text>
          </View>
          
          <View style={styles.confirmationRow}>
            <Text style={[styles.confirmationLabel, { color: currentTheme.textSecondary }]}>
              {texts.price[currentLanguage]}:
            </Text>
            <Text style={[styles.confirmationValue, { color: currentTheme.primary }]}>
              {selectedSession?.price[currentLanguage]}
            </Text>
          </View>
          
          {sessionType === 'group' && (
            <>
              <View style={styles.confirmationRow}>
                <Text style={[styles.confirmationLabel, { color: currentTheme.textSecondary }]}>
                  {texts.availableSeats[currentLanguage]}:
                </Text>
                <Text style={[styles.confirmationValue, { color: '#10B981' }]}>
                  {groupSessions.find(s => s.id === selectedSession?.id)?.availableSeats}/{groupSessions.find(s => s.id === selectedSession?.id)?.totalSeats}
                </Text>
              </View>
              
              <View style={styles.confirmationRow}>
                <Text style={[styles.confirmationLabel, { color: currentTheme.textSecondary }]}>
                  {texts.discount[currentLanguage]}:
                </Text>
                <Text style={[styles.confirmationValue, { color: '#10B981' }]}>
                  {groupSessions.find(s => s.id === selectedSession?.id)?.discount}%
                </Text>
              </View>
            </>
          )}
        </View>
      </LinearGradient>
      
      <View style={styles.specialRequestsContainer}>
        <Text style={[styles.specialRequestsLabel, { color: currentTheme.text }]}>
          {texts.specialRequests[currentLanguage]}
        </Text>
        <TextInput
          style={[
            styles.specialRequestsInput,
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
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: currentTheme.border }]}
          onPress={() => setCurrentStep(sessionType === 'group' ? 2 : 3)}
        >
          <Text style={[styles.navButtonText, { color: currentTheme.text }]}>
            {texts.previous[currentLanguage]}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: currentTheme.primary }]}
          onPress={handleConfirmBooking}
        >
          <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
            {texts.confirmBook[currentLanguage]}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderSessionTypeSelection();
      case 2:
        return renderSessionSelection();
      case 3:
        return renderDateTimeSelection();
      case 4:
        return renderConfirmation();
      default:
        return renderSessionTypeSelection();
    }
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
                {currentLanguage === 'ar' ? 'تم' : currentLanguage === 'en' ? 'Done' : 'مکمل'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {availableDates.map((dateItem) => (
              <TouchableOpacity
                key={dateItem.date}
                style={[
                  styles.modalItem,
                  { 
                    backgroundColor: selectedDate === dateItem.date ? currentTheme.primary + '20' : 'transparent',
                    borderColor: selectedDate === dateItem.date ? currentTheme.primary : currentTheme.border
                  }
                ]}
                onPress={() => setSelectedDate(dateItem.date)}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: selectedDate === dateItem.date ? currentTheme.primary : currentTheme.text }
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
                {currentLanguage === 'ar' ? 'تم' : currentLanguage === 'en' ? 'Done' : 'مکمل'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
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
                    { color: selectedTime === timeItem.time ? '#FFFFFF' : currentTheme.text }
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
        <View style={styles.compactHoursInfo}>
          <Text style={[styles.compactHoursNumber, { color: currentTheme.primary }]}>
            {studentData.availableHours}
          </Text>
          <Text style={[styles.compactHoursLabel, { color: currentTheme.textSecondary }]}>
            {texts.availableHours[currentLanguage]}
          </Text>
        </View>
      </LinearGradient>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.progressIndicator}>
            <View style={[
              styles.progressStep,
              { 
                backgroundColor: currentStep >= step ? currentTheme.primary : currentTheme.border,
                borderColor: currentStep === step ? currentTheme.primary : 'transparent'
              }
            ]}>
              <Text style={[
                styles.progressStepText,
                { color: currentStep >= step ? '#FFFFFF' : currentTheme.textSecondary }
              ]}>
                {step}
              </Text>
            </View>
            {step < 4 && (
              <View style={[
                styles.progressLine,
                { backgroundColor: currentStep > step ? currentTheme.primary : currentTheme.border }
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
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
  compactHoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  compactHoursNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  compactHoursLabel: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  sessionTypeContainer: {
    gap: 16,
    marginBottom: 32,
  },
  sessionTypeCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  sessionTypeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  sessionTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sessionTypeDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
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
  sessionInstructor: {
    fontSize: 14,
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scheduledTime: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeContainer: {
    gap: 16,
    marginBottom: 32,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  confirmationSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationInstructor: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationDetails: {
    gap: 12,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 14,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  specialRequestsContainer: {
    marginBottom: 32,
  },
  specialRequestsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  specialRequestsInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
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
  modalScrollView: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
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
});