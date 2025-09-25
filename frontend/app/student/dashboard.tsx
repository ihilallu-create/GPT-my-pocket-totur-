import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('hours');
  const [activeSessionTab, setActiveSessionTab] = useState('group');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [transferDetails, setTransferDetails] = useState({
    senderName: '',
    transferAmount: '',
    transferTime: ''
  });

  // Messages state
  const [messagesState, setMessagesState] = useState({
    view: 'selector', // 'selector', 'teacher_selection', 'chat'
    chatType: null, // 'customer_service', 'ai_assistant', 'teacher'
    selectedTeacher: null,
    messages: [],
    inputText: '',
    isLoading: false
  });

  const { userData, appSettings } = useUser();

  // Get theme and language from global context
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Mock teachers data
  const teachers = [
    {
      id: '1',
      name: {
        ar: "د. أحمد محمد",
        en: "Dr. Ahmed Mohammed",
        ur: "ڈاکٹر احمد محمد"
      },
      subject: {
        ar: "الرياضيات",
        en: "Mathematics",
        ur: "ریاضی"
      },
      isOnline: true,
      avatar: "👨‍🏫"
    },
    {
      id: '2',
      name: {
        ar: "أ. فاطمة الزهراء",
        en: "Ms. Fatima Alzahra",
        ur: "محترمہ فاطمہ الزہرا"
      },
      subject: {
        ar: "الفيزياء",
        en: "Physics",
        ur: "طبیعیات"
      },
      isOnline: false,
      avatar: "👩‍🏫"
    },
    {
      id: '3',
      name: {
        ar: "د. سارة أحمد",
        en: "Dr. Sarah Ahmed",
        ur: "ڈاکٹر سارہ احمد"
      },
      subject: {
        ar: "الكيمياء",
        en: "Chemistry",
        ur: "کیمسٹری"
      },
      isOnline: true,
      avatar: "👩‍🔬"
    }
  ];

  // Messages functions
  const handleChatTypeSelect = (type) => {
    if (type === 'teacher') {
      setMessagesState(prev => ({
        ...prev,
        view: 'teacher_selection',
        chatType: type
      }));
    } else {
      setMessagesState(prev => ({
        ...prev,
        view: 'chat',
        chatType: type,
        messages: [{
          id: `welcome-${Date.now()}`,
          text: type === 'ai_assistant' 
            ? (currentLanguage === 'ar' ? 'مرحباً! أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟' : 
               currentLanguage === 'en' ? 'Hello! I\'m your AI assistant, how can I help you today?' :
               'سلام! میں آپ کا اے آئی اسسٹنٹ ہوں، آج میں آپ کی کیسے مدد کر سکتا ہوں؟')
            : (currentLanguage === 'ar' ? 'مرحباً! كيف يمكننا مساعدتك اليوم؟' : 
               currentLanguage === 'en' ? 'Hello! How can we help you today?' :
               'سلام! آج ہم آپ کی کیسے مدد کر سکتے ہیں؟'),
          sender: type === 'ai_assistant' ? 'ai' : 'support',
          timestamp: new Date(),
          type: type
        }]
      }));
    }
  };

  const handleTeacherSelect = (teacher) => {
    setMessagesState(prev => ({
      ...prev,
      view: 'chat',
      selectedTeacher: teacher,
      messages: [{
        id: `welcome-teacher-${Date.now()}`,
        text: currentLanguage === 'ar' 
          ? `مرحباً! يمكنك الآن التحدث مع ${teacher.name[currentLanguage]}`
          : currentLanguage === 'en' 
          ? `Hello! You can now chat with ${teacher.name[currentLanguage]}`
          : `سلام! اب آپ ${teacher.name[currentLanguage]} سے بات چیت کر سکتے ہیں`,
        sender: 'teacher',
        timestamp: new Date(),
        type: 'teacher',
        teacherId: teacher.id
      }]
    }));
  };

  const handleBackToSelector = () => {
    setMessagesState({
      view: 'selector',
      chatType: null,
      selectedTeacher: null,
      messages: [],
      inputText: '',
      isLoading: false
    });
  };

  const handleBackToTeacherSelection = () => {
    setMessagesState(prev => ({
      ...prev,
      view: 'teacher_selection',
      selectedTeacher: null,
      messages: []
    }));
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!messagesState.inputText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: messagesState.inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: messagesState.chatType
    };

    setMessagesState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputText: '',
      isLoading: true
    }));

    try {
      if (messagesState.chatType === 'ai_assistant') {
        await handleAIResponse(userMessage.text);
      } else if (messagesState.chatType === 'customer_service') {
        await handleCustomerServiceResponse(userMessage.text);
      } else if (messagesState.chatType === 'teacher') {
        await handleTeacherResponse(userMessage.text);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMessagesState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAIResponse = async (userText) => {
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          language: currentLanguage,
          context: 'educational_assistant'
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        type: 'ai_assistant'
      };

      setMessagesState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));
    } catch (error) {
      console.error('AI response error:', error);
      const fallbackMessage = {
        id: `ai-fallback-${Date.now()}`,
        text: currentLanguage === 'ar' ? 'عذراً، لم أستطع فهم سؤالك. يرجى المحاولة مرة أخرى.' :
              currentLanguage === 'en' ? 'Sorry, I couldn\'t understand your question. Please try again.' :
              'معذرت، میں آپ کا سوال سمجھ نہیں سکا۔ براہ کرم دوبارہ کوشش کریں۔',
        sender: 'ai',
        timestamp: new Date(),
        type: 'ai_assistant'
      };
      setMessagesState(prev => ({
        ...prev,
        messages: [...prev.messages, fallbackMessage]
      }));
    }
  };

  const handleCustomerServiceResponse = async (userText) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const supportMessage = {
      id: `support-${Date.now()}`,
      text: currentLanguage === 'ar' ? 'شكراً لتواصلك معنا. سيتم الرد عليك من قبل فريق الدعم في أقرب وقت.' :
            currentLanguage === 'en' ? 'Thank you for contacting us. You will receive a response from our support team soon.' :
            'ہم سے رابطہ کرنے کا شکریہ۔ آپ کو جلد ہی ہماری سپورٹ ٹیم سے جواب ملے گا۔',
      sender: 'support',
      timestamp: new Date(),
      type: 'customer_service'
    };

    setMessagesState(prev => ({
      ...prev,
      messages: [...prev.messages, supportMessage]
    }));
  };

  const handleTeacherResponse = async (userText) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const teacherMessage = {
      id: `teacher-${Date.now()}`,
      text: currentLanguage === 'ar' ? `تم إرسال رسالتك إلى ${messagesState.selectedTeacher?.name[currentLanguage]}. سيقوم بالرد عليك قريباً.` :
            currentLanguage === 'en' ? `Your message has been sent to ${messagesState.selectedTeacher?.name[currentLanguage]}. They will reply to you soon.` :
            `آپ کا پیغام ${messagesState.selectedTeacher?.name[currentLanguage]} کو بھیج دیا گیا ہے۔ وہ جلد آپ کو جواب دے گا۔`,
      sender: 'teacher',
      timestamp: new Date(),
      type: 'teacher',
      teacherId: messagesState.selectedTeacher?.id
    };

    setMessagesState(prev => ({
      ...prev,
      messages: [...prev.messages, teacherMessage]
    }));
  };

  // Force re-render when language changes
  useEffect(() => {
    // This will trigger a re-render whenever currentLanguage changes
    console.log('Language changed to:', currentLanguage);
  }, [currentLanguage]);

  // Student data from context
  const studentData = {
    name: userData.studentName || (
      currentLanguage === 'ar' ? "مستخدم" : 
      currentLanguage === 'en' ? "User" : "صارف"
    ),
    profileImage: null,
    availableHours: 12,
    totalHours: 30
  };

  // Text content for all languages
  const texts = {
    welcome: {
      ar: "مرحباً",
      en: "Welcome",
      ur: "خوش آمدید"
    },
    availableHours: {
      ar: "عدد الساعات المتاحة",
      en: "Available Hours",
      ur: "دستیاب گھنٹے"
    },
    hours: {
      ar: "الساعات",
      en: "Hours",
      ur: "گھنٹے"
    },
    schedule: {
      ar: "جدول المواعيد",
      en: "Schedule",
      ur: "وقت کا جدول"
    },
    messages: {
      ar: "الرسائل",
      en: "Messages",
      ur: "پیغامات"
    },
    aiAssistant: {
      ar: "المساعد الذكي",
      en: "AI Assistant",
      ur: "اے آئی اسسٹنٹ"
    },
    packages: {
      ar: "الباقات المتاحة",
      en: "Available Packages",
      ur: "دستیاب پیکجز"
    },
    specialOffers: {
      ar: "عروض خاصة",
      en: "Special Offers",
      ur: "خصوصی آفرز"
    },
    comingSoon: {
      ar: "قريباً...",
      en: "Coming Soon...",
      ur: "جلد آرہا ہے..."
    },
    availableTutors: {
      ar: "المساعدين المتاحين",
      en: "Available Tutors",
      ur: "دستیاب ٹیوٹرز"
    },
    specialization: {
      ar: "التخصص",
      en: "Specialization",
      ur: "تخصص"
    },
    rating: {
      ar: "التقييم",
      en: "Rating",
      ur: "ریٹنگ"
    },
    sessions: {
      ar: "جلسة",
      en: "sessions",
      ur: "سیشنز"
    },
    bookSession: {
      ar: "حجز جلسة",
      en: "Book Session",
      ur: "سیشن بک کریں"
    },
    unavailable: {
      ar: "غير متاح",
      en: "Unavailable",
      ur: "دستیاب نہیں"
    },
    myBookings: {
      ar: "حجوزاتي",
      en: "My Bookings",
      ur: "میری بکنگز"
    },
    availableSessions: {
      ar: "الجلسات المتاحة",
      en: "Available Sessions",
      ur: "دستیاب سیشنز"
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
    groupSession: {
      ar: "جلسة جماعية",
      en: "Group Session",
      ur: "گروپ سیشن"
    },
    individualSession: {
      ar: "جلسة فردية",
      en: "Individual Session",
      ur: "انفرادی سیشن"
    },
    confirmed: {
      ar: "مؤكد",
      en: "Confirmed",
      ur: "تصدیق شدہ"
    },
    pending: {
      ar: "قيد الانتظار",
      en: "Pending",
      ur: "انتظار میں"
    },
    rejected: {
      ar: "مرفوض",
      en: "Rejected",
      ur: "مسترد"
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
    purchasePackage: {
      ar: "شراء الباقة",
      en: "Purchase Package",
      ur: "پیکج خریدیں"
    },
    transferAmount: {
      ar: "تحويل المبلغ",
      en: "Transfer Amount",
      ur: "رقم منتقل کریں"
    },
    senderName: {
      ar: "اسم المحول",
      en: "Sender Name",
      ur: "بھیجنے والے کا نام"
    },
    transferAmount: {
      ar: "مبلغ التحويل",
      en: "Transfer Amount",
      ur: "منتقلی کی رقم"
    },
    transferTime: {
      ar: "وقت التحويل",
      en: "Transfer Time",
      ur: "منتقلی کا وقت"
    },
    transferDetails: {
      ar: "تفاصيل التحويل",
      en: "Transfer Details",
      ur: "منتقلی کی تفصیلات"
    },
    bankAccount: {
      ar: "الحساب البنكي: 1234567890",
      en: "Bank Account: 1234567890",
      ur: "بینک اکاؤنٹ: 1234567890"
    },
    bankName: {
      ar: "البنك الأهلي السعودي",
      en: "Saudi National Bank",
      ur: "سعودی نیشنل بینک"
    },
    transferInstructions: {
      ar: "يرجى تحويل المبلغ إلى الحساب أعلاه وإدخال تفاصيل التحويل",
      en: "Please transfer the amount to the above account and enter transfer details",
      ur: "براہ کرم اوپر دیے گئے اکاؤنٹ میں رقم منتقل کریں اور منتقلی کی تفصیلات داخل کریں"
    },
    confirmTransfer: {
      ar: "تأكيد التحويل",
      en: "Confirm Transfer",
      ur: "منتقلی کی تصدیق"
    },
    cancel: {
      ar: "إلغاء",
      en: "Cancel",
      ur: "منسوخ"
    }
  };

  // My Bookings data with sorting logic
  const rawBookings = [
    {
      id: 1,
      subject: {
        ar: "الرياضيات المتقدمة",
        en: "Advanced Mathematics",
        ur: "ایڈوانس ریاضی"
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
      },
      date: new Date('2024-01-15'),
      type: 'group',
      status: 'confirmed',
      statusText: {
        ar: "مؤكد",
        en: "Confirmed",
        ur: "تصدیق شدہ"
      },
      price: {
        ar: "120 ريال",
        en: "$30",
        ur: "120 ریال"
      }
    },
    {
      id: 2,
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
      time: {
        ar: "الأحد 4:00 م",
        en: "Sunday 4:00 PM",
        ur: "اتوار شام 4:00"
      },
      date: new Date('2024-01-20'),
      type: 'individual',
      status: 'pending',
      statusText: {
        ar: "قيد الانتظار",
        en: "Pending",
        ur: "انتظار میں"
      },
      price: {
        ar: "200 ريال",
        en: "$50",
        ur: "200 ریال"
      }
    },
    {
      id: 3,
      subject: {
        ar: "الفيزياء التطبيقية",
        en: "Applied Physics",
        ur: "اپلائیڈ فزکس"
      },
      instructor: {
        ar: "د. سارة أحمد",
        en: "Dr. Sarah Ahmed",
        ur: "ڈاکٹر سارہ احمد"
      },
      time: {
        ar: "الاثنين 6:00 م",
        en: "Monday 6:00 PM",
        ur: "پیر شام 6:00"
      },
      date: new Date('2024-01-10'),
      type: 'group',
      status: 'rejected',
      statusText: {
        ar: "مرفوض",
        en: "Rejected",
        ur: "مسترد"
      },
      price: {
        ar: "100 ريال",
        en: "$25",
        ur: "100 ریال"
      }
    },
    {
      id: 4,
      subject: {
        ar: "الكيمياء العضوية",
        en: "Organic Chemistry",
        ur: "آرگینک کیمسٹری"
      },
      instructor: {
        ar: "د. محمد علي",
        en: "Dr. Mohammed Ali",
        ur: "ڈاکٹر محمد علی"
      },
      time: {
        ar: "الثلاثاء 3:00 م",
        en: "Tuesday 3:00 PM",
        ur: "منگل دوپہر 3:00"
      },
      date: new Date('2024-01-18'),
      type: 'individual',
      status: 'confirmed',
      statusText: {
        ar: "مؤكد",
        en: "Confirmed",
        ur: "تصدیق شدہ"
      },
      price: {
        ar: "180 ريال",
        en: "$45",
        ur: "180 ریال"
      }          
    }
  ];

  // Sort bookings: by status priority (confirmed > pending > rejected) then by date (newest first)
  const myBookings = rawBookings.sort((a, b) => {
    // Priority order: confirmed = 0, pending = 1, rejected = 2
    const statusPriority = { confirmed: 0, pending: 1, rejected: 2 };
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];
    
    // First sort by status priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same status, sort by date (newest first)
    return b.date.getTime() - a.date.getTime();
  });

  // Group sessions data (compact)
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
    }
  ];

  // Individual sessions data (compact)
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
      available: false
    }
  ];

  // Handle package purchase
  const handlePackagePurchase = (pkg) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  // Handle transfer confirmation
  const handleTransferConfirmation = () => {
    if (!transferDetails.senderName.trim() || !transferDetails.transferAmount.trim() || !transferDetails.transferTime.trim()) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 
        currentLanguage === 'en' ? 'Please fill all required fields' : 
        'برائے کرم تمام مطلوبہ فیلڈز کو بھریں'
      );
      return;
    }

    // Simulate purchase processing
    Alert.alert(
      currentLanguage === 'ar' ? 'تم الدفع' : currentLanguage === 'en' ? 'Payment Processed' : 'ادائیگی مکمل',
      currentLanguage === 'ar' ? 'تم استلام طلبك وسيتم تفعيل الباقة خلال 24 ساعة' : 
      currentLanguage === 'en' ? 'Your request has been received and the package will be activated within 24 hours' : 
      'آپ کی درخواست موصول ہو گئی ہے اور پیکج 24 گھنٹوں میں فعال ہو جائے گا',
      [
        {
          text: currentLanguage === 'ar' ? 'حسناً' : currentLanguage === 'en' ? 'OK' : 'ٹھیک ہے',
          onPress: () => {
            setShowPurchaseModal(false);
            setTransferDetails({ senderName: '', transferAmount: '', transferTime: '' });
            setSelectedPackage(null);
          }
        }
      ]
    );
  };

  const tabs = [
    { id: 'hours', icon: '⏰' },
    { id: 'schedule', icon: '📅' },
    { id: 'messages', icon: '💬' },
  ];

  const packages = [
    { 
      id: 1, 
      name: {
        ar: "باقة أساسية",
        en: "Basic Package",
        ur: "بنیادی پیکج"
      }, 
      hours: 10, 
      price: {
        ar: "299 ريال",
        en: "$79",
        ur: "299 ریال"
      }, 
      description: {
        ar: "مناسبة للطلاب المبتدئين",
        en: "Suitable for beginner students",
        ur: "ابتدائی طلباء کے لیے موزوں"
      }
    },
    { 
      id: 2, 
      name: {
        ar: "باقة متقدمة",
        en: "Advanced Package",
        ur: "ایڈوانس پیکج"
      }, 
      hours: 20, 
      price: {
        ar: "549 ريال",
        en: "$149",
        ur: "549 ریال"
      }, 
      description: {
        ar: "للطلاب الذين يحتاجون دعم إضافي",
        en: "For students who need extra support",
        ur: "ان طلباء کے لیے جنہیں اضافی مدد کی ضرورت ہے"
      }
    },
    { 
      id: 3, 
      name: {
        ar: "باقة شاملة",
        en: "Premium Package",
        ur: "پریمیم پیکج"
      }, 
      hours: 35, 
      price: {
        ar: "899 ريال",
        en: "$239",
        ur: "899 ریال"
      }, 
      description: {
        ar: "للحصول على أفضل النتائج",
        en: "For the best results",
        ur: "بہترین نتائج کے لیے"
      }
    },
  ];

  const offers = [
    { 
      id: 1, 
      title: {
        ar: "خصم 20%",
        en: "20% Discount",
        ur: "20% رعایت"
      }, 
      description: {
        ar: "على جميع الباقات لفترة محدودة",
        en: "On all packages for limited time",
        ur: "محدود وقت کے لیے تمام پیکجز پر"
      }, 
      color: '#E11D48' 
    },
    { 
      id: 2, 
      title: {
        ar: "ساعات مجانية",
        en: "Free Hours",
        ur: "مفت گھنٹے"
      }, 
      description: {
        ar: "احصل على 3 ساعات مجانية مع أي باقة",
        en: "Get 3 free hours with any package",
        ur: "کسی بھی پیکج کے ساتھ 3 مفت گھنٹے حاصل کریں"
      }, 
      color: '#059669' 
    },
  ];

  // Tutors/Assistants data
  const tutors = [
    {
      id: 1,
      name: {
        ar: "أحمد محمد",
        en: "Ahmed Mohammed",
        ur: "احمد محمد"
      },
      university: {
        ar: "جامعة الملك سعود",
        en: "King Saud University",
        ur: "کنگ سعود یونیورسٹی"
      },
      specialization: {
        ar: "الرياضيات",
        en: "Mathematics",
        ur: "ریاضی"
      },
      rating: 4.8,
      totalSessions: 150,
      hourlyRate: {
        ar: "80 ريال/ساعة",
        en: "$20/hour",
        ur: "80 ریال/گھنٹہ"
      },
      image: null,
      available: true
    },
    {
      id: 2,
      name: {
        ar: "سارة أحمد",
        en: "Sarah Ahmed",
        ur: "سارہ احمد"
      },
      university: {
        ar: "جامعة الأميرة نورة",
        en: "Princess Nourah University",
        ur: "پرنسس نورا یونیورسٹی"
      },
      specialization: {
        ar: "الفيزياء",
        en: "Physics",
        ur: "طبیعیات"
      },
      rating: 4.9,
      totalSessions: 200,
      hourlyRate: {
        ar: "85 ريال/ساعة",
        en: "$22/hour",
        ur: "85 ریال/گھنٹہ"
      },
      image: null,
      available: true
    },
    {
      id: 3,
      name: {
        ar: "محمد علي",
        en: "Mohammed Ali",
        ur: "محمد علی"
      },
      university: {
        ar: "جامعة الإمام",
        en: "Imam University",
        ur: "امام یونیورسٹی"
      },
      specialization: {
        ar: "الكيمياء",
        en: "Chemistry",
        ur: "کیمسٹری"
      },
      rating: 4.7,
      totalSessions: 120,
      hourlyRate: {
        ar: "75 ريال/ساعة",
        en: "$18/hour",
        ur: "75 ریال/گھنٹہ"
      },
      image: null,
      available: false
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hours':
        return (
          <View style={styles.tabContent}>
            {/* Hours Summary */}
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
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        { width: `${(studentData.availableHours / studentData.totalHours) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: currentTheme.textSecondary }]}>
                    {studentData.availableHours} / {studentData.totalHours}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Packages */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                {texts.packages[currentLanguage]}
              </Text>
              {packages.map((pkg) => (
                <LinearGradient
                  key={pkg.id}
                  colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.packageCard}
                >
                  <View style={styles.packageInfo}>
                    <Text style={[styles.packageName, { color: currentTheme.text }]}>
                      {pkg.name[currentLanguage]}
                    </Text>
                    <Text style={[styles.packageDescription, { color: currentTheme.textSecondary }]}>
                      {pkg.description[currentLanguage]}
                    </Text>
                    <View style={styles.packageDetails}>
                      <Text style={[styles.packageHours, { color: currentTheme.primary }]}>
                        {pkg.hours} {currentLanguage === 'ar' ? 'ساعة' : currentLanguage === 'en' ? 'hours' : 'گھنٹے'}
                      </Text>
                      <Text style={[styles.packagePrice, { color: currentTheme.text }]}>
                        {pkg.price[currentLanguage]}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.buyButton, { backgroundColor: currentTheme.primary }]}
                    onPress={() => handlePackagePurchase(pkg)}
                  >
                    <Text style={styles.buyButtonText}>
                      {currentLanguage === 'ar' ? 'شراء' : currentLanguage === 'en' ? 'Buy' : 'خریدیں'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </View>
          </View>
        );
      case 'schedule':
        return (
          <View style={styles.tabContent}>
            {/* Hours Summary - Compact Version */}
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.compactHoursCard}
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

            {/* My Bookings - Enhanced Design */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                {texts.myBookings[currentLanguage]}
              </Text>
            </View>
            
            <View style={styles.bookingsGrid}>
              {myBookings.slice(0, 3).map((booking, index) => (
                <LinearGradient
                  key={booking.id}
                  colors={
                    booking.status === 'confirmed' ? ['#10B981', '#06B6D4'] :
                    booking.status === 'pending' ? ['#F59E0B', '#F97316'] :
                    ['#EF4444', '#F43F5E']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bookingCard}
                >
                  <View style={styles.bookingCardContent}>
                    <View style={styles.bookingHeader}>
                      <Text style={styles.bookingSubject} numberOfLines={1}>
                        {booking.subject[currentLanguage]}
                      </Text>
                      <View style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: '#FFFFFF'
                        }
                      ]}>
                        <Text style={[styles.statusText, {
                          color: booking.status === 'confirmed' ? '#10B981' : 
                                 booking.status === 'pending' ? '#F59E0B' : '#EF4444'
                        }]}>
                          {booking.status === 'confirmed' ? '✓' : 
                           booking.status === 'pending' ? '⏳' : '✗'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.bookingInstructor} numberOfLines={1}>
                      👨‍🏫 {booking.instructor[currentLanguage]}
                    </Text>
                    
                    <View style={styles.bookingDetails}>
                      <View style={styles.bookingDetailItem}>
                        <Text style={styles.bookingDetailIcon}>📅</Text>
                        <Text style={styles.bookingDetailText}>
                          {booking.date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                      
                      <View style={styles.bookingDetailItem}>
                        <Text style={styles.bookingDetailIcon}>⏰</Text>
                        <Text style={styles.bookingDetailText}>
                          {booking.time[currentLanguage]}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingFooter}>
                      <Text style={styles.bookingType}>
                        {booking.type === 'group' ? 
                          (currentLanguage === 'ar' ? '👥 جماعية' : currentLanguage === 'en' ? '👥 Group' : '👥 گروپ') :
                          (currentLanguage === 'ar' ? '👤 فردية' : currentLanguage === 'en' ? '👤 Individual' : '👤 انفرادی')
                        }
                      </Text>
                      <Text style={styles.bookingPrice}>
                        {booking.price[currentLanguage]}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>

            {/* Available Tutors */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                {texts.availableTutors[currentLanguage]}
              </Text>
            </View>
            
            <View style={styles.tutorsGrid}>
              {tutors.slice(0, 4).map((tutor) => (
                <TouchableOpacity
                  key={tutor.id}
                  style={styles.tutorGridCard}
                  onPress={() => router.push(`/student/unified-booking?tutorId=${tutor.id}&tutorName=${tutor.name[currentLanguage]}`)}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.tutorGridCardContent}
                  >
                    <View style={[styles.tutorGridAvatar, { backgroundColor: currentTheme.primary }]}>
                      <Text style={styles.tutorGridInitial}>
                        {tutor.name[currentLanguage].charAt(0)}
                      </Text>
                    </View>
                    
                    <Text style={[styles.tutorGridName, { color: currentTheme.text }]} numberOfLines={1}>
                      {tutor.name[currentLanguage]}
                    </Text>
                    
                    <Text style={[styles.tutorGridUniversity, { color: currentTheme.textSecondary }]} numberOfLines={2}>
                      {tutor.university[currentLanguage]}
                    </Text>
                    
                    <View style={styles.tutorGridRating}>
                      <Text style={[styles.tutorGridRatingText, { color: '#F59E0B' }]}>
                        ⭐ {tutor.rating}
                      </Text>
                      <View style={[
                        styles.tutorGridStatus, 
                        { backgroundColor: tutor.available ? '#10B981' : '#EF4444' }
                      ]}>
                        <Text style={styles.tutorGridStatusText}>
                          {tutor.available ? 
                            (currentLanguage === 'ar' ? 'متاح' : currentLanguage === 'en' ? 'Available' : 'دستیاب') :
                            (currentLanguage === 'ar' ? 'مشغول' : currentLanguage === 'en' ? 'Busy' : 'مصروف')
                          }
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 'messages':
        if (messagesState.view === 'selector') {
          // Chat type selector
          return (
            <View style={styles.tabContent}>
              <View style={styles.messagesChatSelector}>
                <Text style={[styles.sectionTitle, { color: currentTheme.text, marginBottom: 20 }]}>
                  {currentLanguage === 'ar' ? 'اختر نوع المحادثة' : 
                   currentLanguage === 'en' ? 'Choose Chat Type' : 
                   'بات چیت کی قسم منتخب کریں'}
                </Text>
                
                <TouchableOpacity
                  style={[styles.chatOptionCard, { backgroundColor: currentTheme.surface }]}
                  onPress={() => handleChatTypeSelect('customer_service')}
                >
                  <LinearGradient
                    colors={['#10B981', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatOptionGradient}
                  >
                    <Text style={styles.chatOptionIcon}>🎧</Text>
                    <Text style={styles.chatOptionTitle}>
                      {currentLanguage === 'ar' ? 'خدمة العملاء' : 
                       currentLanguage === 'en' ? 'Customer Service' : 
                       'کسٹمر سروس'}
                    </Text>
                    <Text style={styles.chatOptionDescription}>
                      {currentLanguage === 'ar' ? 'للدعم التقني والاستفسارات' : 
                       currentLanguage === 'en' ? 'For technical support and inquiries' : 
                       'تکنیکی سپورٹ اور پوچھ گچھ کے لیے'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chatOptionCard, { backgroundColor: currentTheme.surface }]}
                  onPress={() => handleChatTypeSelect('ai_assistant')}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatOptionGradient}
                  >
                    <Text style={styles.chatOptionIcon}>🤖</Text>
                    <Text style={styles.chatOptionTitle}>
                      {currentLanguage === 'ar' ? 'الذكاء الصناعي' : 
                       currentLanguage === 'en' ? 'AI Assistant' : 
                       'اے آئی اسسٹنٹ'}
                    </Text>
                    <Text style={styles.chatOptionDescription}>
                      {currentLanguage === 'ar' ? 'مساعد ذكي للدراسة والأسئلة الأكاديمية' : 
                       currentLanguage === 'en' ? 'Smart assistant for studying and academic questions' : 
                       'پڑھائی اور تعلیمی سوالات کے لیے سمارٹ اسسٹنٹ'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chatOptionCard, { backgroundColor: currentTheme.surface }]}
                  onPress={() => handleChatTypeSelect('teacher')}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#F97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatOptionGradient}
                  >
                    <Text style={styles.chatOptionIcon}>👨‍🏫</Text>
                    <Text style={styles.chatOptionTitle}>
                      {currentLanguage === 'ar' ? 'المعلم' : 
                       currentLanguage === 'en' ? 'Teacher' : 
                       'استاد'}
                    </Text>
                    <Text style={styles.chatOptionDescription}>
                      {currentLanguage === 'ar' ? 'للتواصل مع معلميك وطرح الأسئلة' : 
                       currentLanguage === 'en' ? 'To communicate with your teachers and ask questions' : 
                       'اپنے اساتذہ سے رابطہ اور سوالات پوچھنے کے لیے'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        }
        
        else if (messagesState.view === 'teacher_selection') {
          // Teacher selection view
          return (
            <View style={styles.tabContent}>
              <View style={styles.teacherSelectionHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handleBackToSelector}
                >
                  <Text style={[styles.backIcon, { color: currentTheme.primary }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                  {currentLanguage === 'ar' ? 'اختر المعلم' : 
                   currentLanguage === 'en' ? 'Choose Teacher' : 
                   'استاد منتخب کریں'}
                </Text>
              </View>
              
              <ScrollView style={styles.teachersList}>
                {teachers.map((teacher) => (
                  <TouchableOpacity
                    key={teacher.id}
                    style={[styles.teacherCard, { backgroundColor: currentTheme.surface }]}
                    onPress={() => handleTeacherSelect(teacher)}
                  >
                    <LinearGradient
                      colors={teacher.isOnline ? ['#10B981', '#06B6D4'] : ['#6B7280', '#9CA3AF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.teacherCardGradient}
                    >
                      <Text style={styles.teacherAvatar}>{teacher.avatar}</Text>
                      <View style={styles.teacherInfo}>
                        <Text style={styles.teacherName}>
                          {teacher.name[currentLanguage]}
                        </Text>
                        <Text style={styles.teacherSubject}>
                          {teacher.subject[currentLanguage]}
                        </Text>
                        <Text style={styles.teacherStatus}>
                          {teacher.isOnline 
                            ? (currentLanguage === 'ar' ? '🟢 متصل' : currentLanguage === 'en' ? '🟢 Online' : '🟢 آن لائن')
                            : (currentLanguage === 'ar' ? '⚫ غير متصل' : currentLanguage === 'en' ? '⚫ Offline' : '⚫ آف لائن')
                          }
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        }
        
        else if (messagesState.view === 'chat') {
          // Chat view - Full functional chat interface
          return (
            <View style={styles.tabContent}>
              <View style={styles.chatHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={messagesState.chatType === 'teacher' ? handleBackToTeacherSelection : handleBackToSelector}
                >
                  <Text style={[styles.backIcon, { color: currentTheme.primary }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.chatTitle, { color: currentTheme.text }]}>
                  {messagesState.chatType === 'customer_service' 
                    ? (currentLanguage === 'ar' ? 'خدمة العملاء' : currentLanguage === 'en' ? 'Customer Service' : 'کسٹمر سروس')
                    : messagesState.chatType === 'ai_assistant'
                    ? (currentLanguage === 'ar' ? 'الذكاء الصناعي' : currentLanguage === 'en' ? 'AI Assistant' : 'اے آئی اسسٹنٹ')
                    : messagesState.selectedTeacher?.name[currentLanguage] || 'معلم'
                  }
                </Text>
              </View>
              
              {/* Messages */}
              <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
                {messagesState.messages.map((message) => (
                  <View key={message.id} style={[
                    styles.messageContainer,
                    message.sender === 'user' ? styles.userMessageContainer : styles.otherMessageContainer
                  ]}>
                    <LinearGradient
                      colors={message.sender === 'user' 
                        ? [currentTheme.primary, currentTheme.primary + 'CC'] 
                        : messagesState.chatType === 'ai_assistant' ? ['#6366F1', '#8B5CF6'] :
                          messagesState.chatType === 'customer_service' ? ['#10B981', '#06B6D4'] :
                          ['#F59E0B', '#F97316']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.messageBubble,
                        message.sender === 'user' ? styles.userMessageBubble : styles.otherMessageBubble
                      ]}
                    >
                      <Text style={[styles.messageText, { color: '#FFFFFF' }]}>
                        {message.text}
                      </Text>
                      <Text style={[styles.messageTime, { color: '#FFFFFF99' }]}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
                
                {messagesState.isLoading && (
                  <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
                      {currentLanguage === 'ar' ? 'جاري الكتابة...' : 
                       currentLanguage === 'en' ? 'Typing...' : 
                       'لکھا جا رہا ہے...'}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Input Area */}
              <View style={[styles.inputContainer, { backgroundColor: currentTheme.surface }]}>
                <TextInput
                  style={[
                    styles.messageInput,
                    { 
                      color: currentTheme.text,
                      backgroundColor: currentTheme.background,
                      borderColor: currentTheme.border
                    }
                  ]}
                  placeholder={currentLanguage === 'ar' ? 'اكتب رسالة...' : 
                              currentLanguage === 'en' ? 'Type a message...' : 
                              'پیغام لکھیں...'}
                  placeholderTextColor={currentTheme.textSecondary}
                  value={messagesState.inputText}
                  onChangeText={(text) => setMessagesState(prev => ({ ...prev, inputText: text }))}
                  multiline
                  maxLength={500}
                  editable={!messagesState.isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { 
                      backgroundColor: messagesState.inputText.trim() ? currentTheme.primary : currentTheme.border,
                      opacity: messagesState.isLoading ? 0.5 : 1
                    }
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messagesState.inputText.trim() || messagesState.isLoading}
                >
                  <Text style={styles.sendButtonText}>
                    {currentLanguage === 'ar' ? 'إرسال' : currentLanguage === 'en' ? 'Send' : 'بھیجیں'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }
        
        return null;
      default:
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoon}>
              <Text style={[styles.comingSoonText, { color: currentTheme.textSecondary }]}>
                {texts.comingSoon[currentLanguage]}
              </Text>
            </View>
          </View>
        );
    }
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
          style={styles.profileSection}
          onPress={() => router.push('/student/profile')}
        >
          <View style={[styles.profileImage, { backgroundColor: currentTheme.primary }]}>
            <Text style={styles.profileInitial}>
              {studentData.name.charAt(0)}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: currentTheme.textSecondary }]}>
            {texts.welcome[currentLanguage]}
          </Text>
          <Text style={[styles.studentName, { color: currentTheme.text }]}>
            {studentData.name}
          </Text>
        </View>
      </LinearGradient>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={[styles.bottomTabs, { backgroundColor: currentTheme.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: currentTheme.primary + '20' }
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabIcon,
              { color: activeTab === tab.id ? currentTheme.primary : currentTheme.textSecondary }
            ]}>
              {tab.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Purchase Modal */}
      <Modal
        visible={showPurchaseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.purchaseModalContent}
          >
            {selectedPackage && (
              <>
                <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                  {texts.purchasePackage[currentLanguage]}
                </Text>
                
                <View style={styles.packageSummary}>
                  <Text style={[styles.packageSummaryTitle, { color: currentTheme.text }]}>
                    {selectedPackage.name[currentLanguage]}
                  </Text>
                  <Text style={[styles.packageSummaryPrice, { color: currentTheme.primary }]}>
                    {selectedPackage.price[currentLanguage]}
                  </Text>
                  <Text style={[styles.packageSummaryDescription, { color: currentTheme.textSecondary }]}>
                    {selectedPackage.hours} {currentLanguage === 'ar' ? 'ساعة' : currentLanguage === 'en' ? 'hours' : 'گھنٹے'}
                  </Text>
                </View>

                <View style={styles.bankInfo}>
                  <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                    {texts.transferDetails[currentLanguage]}
                  </Text>
                  <Text style={[styles.bankName, { color: currentTheme.primary }]}>
                    {texts.bankName[currentLanguage]}
                  </Text>
                  <Text style={[styles.bankAccount, { color: currentTheme.text }]}>
                    {texts.bankAccount[currentLanguage]}
                  </Text>
                  <Text style={[styles.transferInstructions, { color: currentTheme.textSecondary }]}>
                    {texts.transferInstructions[currentLanguage]}
                  </Text>
                </View>

                <View style={styles.transferForm}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
                      {texts.senderName[currentLanguage]} *
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border
                        }
                      ]}
                      placeholder={texts.senderName[currentLanguage]}
                      placeholderTextColor={currentTheme.textSecondary}
                      value={transferDetails.senderName}
                      onChangeText={(text) => setTransferDetails(prev => ({ ...prev, senderName: text }))}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
                      {texts.transferAmount[currentLanguage]} *
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border
                        }
                      ]}
                      placeholder={texts.transferAmount[currentLanguage]}
                      placeholderTextColor={currentTheme.textSecondary}
                      value={transferDetails.transferAmount}
                      onChangeText={(text) => setTransferDetails(prev => ({ ...prev, transferAmount: text }))}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
                      {texts.transferTime[currentLanguage]} *
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        { 
                          color: currentTheme.text,
                          backgroundColor: currentTheme.surface,
                          borderColor: currentTheme.border
                        }
                      ]}
                      placeholder={currentLanguage === 'ar' ? 'مثال: 2:30 مساءً' : 
                                 currentLanguage === 'en' ? 'Example: 2:30 PM' : 
                                 'مثال: 2:30 PM'}
                      placeholderTextColor={currentTheme.textSecondary}
                      value={transferDetails.transferTime}
                      onChangeText={(text) => setTransferDetails(prev => ({ ...prev, transferTime: text }))}
                    />
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: currentTheme.border }]}
                    onPress={() => setShowPurchaseModal(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: currentTheme.text }]}>
                      {texts.cancel[currentLanguage]}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton, { backgroundColor: currentTheme.primary }]}
                    onPress={handleTransferConfirmation}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                      {texts.confirmTransfer[currentLanguage]}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </LinearGradient>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSection: {
    marginRight: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  hoursCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  progressText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  packageCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  packageDescription: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  packageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageHours: {
    fontSize: 14,
    fontWeight: '600',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  offerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  offerInfo: {
    alignItems: 'flex-end',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    textAlign: 'right',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  bottomTabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  // Schedule Tab Styles
  tutorsContainer: {
    gap: 16,
  },
  tutorCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tutorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tutorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tutorInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tutorUniversity: {
    fontSize: 13,
    marginBottom: 2,
  },
  tutorSpecialization: {
    fontSize: 12,
    fontWeight: '500',
  },
  tutorStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tutorDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  tutorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  bookButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // New Compact Schedule Styles
  compactHoursCard: {
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
  bookingsScroll: {
    marginBottom: 20,
  },
  bookingCard: {
    width: 200,
    marginLeft: 20,
    marginRight: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  bookingInstructor: {
    fontSize: 12,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  bookingType: {
    fontSize: 11,
  },
  sessionTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  sessionTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  sessionTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionsContainer: {
    flex: 1,
  },
  sessionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  compactSessionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginBottom: 8,
  },
  compactSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  compactSessionSubject: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 4,
  },
  compactSessionInstructor: {
    fontSize: 11,
    marginBottom: 4,
  },
  compactSessionInfo: {
    marginBottom: 8,
  },
  compactSessionTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  seatsText: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactBookButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  compactBookButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  // Improved My Bookings Styles
  bookingsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  improvedBookingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  improvedBookingSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  improvedBookingInstructor: {
    fontSize: 13,
    marginBottom: 2,
  },
  improvedStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  improvedStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingCardDetails: {
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  improvedBookingTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  improvedBookingType: {
    fontSize: 12,
  },
  improvedBookingPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  bookingDate: {
    fontSize: 11,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyBookingsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Table Layout Styles
  tableContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 3,
    minHeight: 60,
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tableCellText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  tableCellSubText: {
    fontSize: 10,
    textAlign: 'center',
  },
  tableStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  tableStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  showMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Tutors Grid Styles
  tutorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tutorGridCard: {
    width: '48%',
    marginBottom: 12,
  },
  tutorGridCardContent: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  tutorGridAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tutorGridInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tutorGridName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  tutorGridUniversity: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  tutorGridRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  tutorGridRatingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tutorGridStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tutorGridStatusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  // Purchase Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  purchaseModalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  packageSummary: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    marginBottom: 20,
  },
  packageSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packageSummaryPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packageSummaryDescription: {
    fontSize: 14,
  },
  bankInfo: {
    marginBottom: 20,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bankAccount: {
    fontSize: 16,
    marginBottom: 8,
  },
  transferInstructions: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  transferForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Messages Chat Selector Styles
  messagesChatSelector: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chatOptionCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  chatOptionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  chatOptionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  chatOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  chatOptionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Teacher Selection Styles
  teacherSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  teachersList: {
    paddingHorizontal: 20,
  },
  teacherCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  teacherCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  teacherAvatar: {
    fontSize: 40,
    marginRight: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  teacherSubject: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  teacherStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Chat Header Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.3)',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  chatPlaceholderText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Chat Messages Styles
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Enhanced Booking Cards Styles
  bookingsGrid: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bookingCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bookingCardContent: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookingInstructor: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bookingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingDetailIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  bookingDetailText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.3)',
  },
  bookingType: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookingPrice: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },
});