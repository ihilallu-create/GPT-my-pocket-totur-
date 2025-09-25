import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'support' | 'teacher';
  timestamp: Date;
  type: 'customer_service' | 'ai_assistant' | 'teacher';
  teacherId?: string;
  teacherName?: string;
  isRead?: boolean;
}

interface Teacher {
  id: string;
  name: {
    ar: string;
    en: string;
    ur: string;
  };
  subject: {
    ar: string;
    en: string;
    ur: string;
  };
  avatar?: string;
  isOnline: boolean;
  unreadCount?: number;
}

export default function MessagesScreen() {
  const { userData, appSettings } = useUser();
  const [activeChat, setActiveChat] = useState<'customer_service' | 'ai_assistant' | 'teacher'>('customer_service');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({
    customer_service: 0,
    ai_assistant: 0,
    teacher: 0
  });
  const scrollViewRef = useRef<ScrollView>(null);

  // Get theme and language from global context
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Get chat type from URL params if available
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const chatType = searchParams.get('type');
    if (chatType && ['customer_service', 'ai_assistant', 'teacher'].includes(chatType)) {
      setActiveChat(chatType as 'customer_service' | 'ai_assistant' | 'teacher');
    }
  }, []);

  // Mock teachers data
  const teachers: Teacher[] = [
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
      unreadCount: 2
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
      unreadCount: 0
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
      unreadCount: 1
    }
  ];

  // Text content for all languages
  const texts = {
    messages: {
      ar: "الرسائل",
      en: "Messages",
      ur: "پیغامات"
    },
    customerService: {
      ar: "خدمة العملاء",
      en: "Customer Service",
      ur: "کسٹمر سروس"
    },
    aiAssistant: {
      ar: "الذكاء الصناعي",
      en: "AI Assistant",
      ur: "اے آئی اسسٹنٹ"
    },
    teacher: {
      ar: "المعلم",
      en: "Teacher",
      ur: "استاد"
    },
    selectTeacher: {
      ar: "اختر المعلم",
      en: "Select Teacher",
      ur: "استاد منتخب کریں"
    },
    chooseTeacher: {
      ar: "اختر المعلم للمحادثة",
      en: "Choose a teacher to chat with",
      ur: "بات چیت کے لیے استاد کا انتخاب کریں"
    },
    changeTeacher: {
      ar: "اضغط لتغيير المعلم",
      en: "Tap to change teacher",
      ur: "استاد تبدیل کرنے کے لیے ٹیپ کریں"
    },
    online: {
      ar: "متصل",
      en: "Online",
      ur: "آن لائن"
    },
    offline: {
      ar: "غير متصل",
      en: "Offline",
      ur: "آف لائن"
    },
    typeMessage: {
      ar: "اكتب رسالة...",
      en: "Type a message...",
      ur: "پیغام لکھیں..."
    },
    send: {
      ar: "إرسال",
      en: "Send",
      ur: "بھیجیں"
    },
    welcomeMessage: {
      customer_service: {
        ar: "مرحباً! كيف يمكننا مساعدتك اليوم؟",
        en: "Hello! How can we help you today?",
        ur: "سلام! آج ہم آپ کی کیسے مدد کر سکتے ہیں؟"
      },
      ai_assistant: {
        ar: "مرحباً! أنا مساعدك الذكي، أستطيع مساعدتك في دراستك وأسئلتك الأكاديمية.",
        en: "Hello! I'm your AI assistant, I can help you with your studies and academic questions.",
        ur: "سلام! میں آپ کا اے آئی اسسٹنٹ ہوں، میں آپ کی پڑھائی اور تعلیمی سوالات میں مدد کر سکتا ہوں۔"
      },
      teacher: {
        ar: "مرحباً! يمكنك التواصل مع معلميك هنا لطرح الأسئلة ومناقشة المواد الدراسية.",
        en: "Hello! You can communicate with your teachers here to ask questions and discuss course materials.",
        ur: "سلام! آپ یہاں اپنے اساتذہ سے رابطہ کرکے سوالات پوچھ سکتے ہیں اور نصابی مواد پر بحث کر سکتے ہیں۔"
      }
    },
    noMessages: {
      ar: "لا توجد رسائل بعد",
      en: "No messages yet",
      ur: "ابھی تک کوئی پیغام نہیں"
    },
    startConversation: {
      ar: "ابدأ محادثة جديدة",
      en: "Start a new conversation",
      ur: "نئی گفتگو شروع کریں"
    }
  };

  // Initialize notifications and unread counts
  useEffect(() => {
    setupNotifications();
    loadUnreadCounts();
  }, []);

  // Setup notifications
  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Schedule a test notification (you can remove this in production)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: texts.messages[currentLanguage],
          body: currentLanguage === 'ar' ? 'مرحباً بك في تطبيق My Pocket Tutor!' : 
                currentLanguage === 'en' ? 'Welcome to My Pocket Tutor!' : 
                'My Pocket Tutor میں خوش آمدید!',
        },
        trigger: { seconds: 2 },
      });
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  // Load unread counts from storage
  const loadUnreadCounts = async () => {
    try {
      const counts = await AsyncStorage.getItem('unreadCounts');
      if (counts) {
        setUnreadCounts(JSON.parse(counts));
      }
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  // Save unread counts to storage
  const saveUnreadCounts = async (counts: typeof unreadCounts) => {
    try {
      await AsyncStorage.setItem('unreadCounts', JSON.stringify(counts));
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error saving unread counts:', error);
    }
  };

  // Mark messages as read when switching chat
  const markAsRead = async (chatType: 'customer_service' | 'ai_assistant' | 'teacher') => {
    const newCounts = { ...unreadCounts };
    newCounts[chatType] = 0;
    await saveUnreadCounts(newCounts);
  };

  // Add new message and handle unread count
  const addNewMessage = async (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // If the message is not from the user and not in the current active chat, increment unread count
    if (message.sender !== 'user' && message.type !== activeChat) {
      const newCounts = { ...unreadCounts };
      newCounts[message.type] = (newCounts[message.type] || 0) + 1;
      await saveUnreadCounts(newCounts);
      
      // Send notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.type === 'ai_assistant' ? texts.aiAssistant[currentLanguage] :
                 message.type === 'teacher' ? texts.teacher[currentLanguage] : 
                 texts.customerService[currentLanguage],
          body: message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text,
        },
        trigger: null,
      });
    }
  };

  // Handle chat type change
  const handleChatTypeChange = (chatType: 'customer_service' | 'ai_assistant' | 'teacher') => {
    if (chatType === 'teacher' && !selectedTeacher) {
      setShowTeacherModal(true);
      return;
    }
    
    setActiveChat(chatType);
    markAsRead(chatType);
    
    // Initialize welcome message
    const welcomeMessage: Message = {
      id: `welcome-${chatType}-${Date.now()}`,
      text: chatType === 'teacher' && selectedTeacher 
        ? `${currentLanguage === 'ar' ? 'مرحباً! يمكنك الآن المحادثة مع' : 
             currentLanguage === 'en' ? 'Hello! You can now chat with' : 
             'سلام! اب آپ بات چیت کر سکتے ہیں'} ${selectedTeacher.name[currentLanguage]}`
        : texts.welcomeMessage[chatType][currentLanguage],
      sender: chatType === 'ai_assistant' ? 'ai' : chatType === 'teacher' ? 'teacher' : 'support',
      timestamp: new Date(),
      type: chatType,
      teacherId: selectedTeacher?.id,
      teacherName: selectedTeacher?.name[currentLanguage]
    };
    setMessages([welcomeMessage]);
  };

  // Handle teacher selection
  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(false);
    handleChatTypeChange('teacher');
  };

  // Scroll to bottom when new message is added
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: activeChat,
      teacherId: selectedTeacher?.id,
      teacherName: selectedTeacher?.name[currentLanguage]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (activeChat === 'ai_assistant') {
        // Call AI Assistant
        await handleAIResponse(userMessage.text);
      } else if (activeChat === 'customer_service') {
        // Handle customer service (mock response for now)
        await handleCustomerServiceResponse(userMessage.text);
      } else if (activeChat === 'teacher') {
        // Handle teacher communication (mock response for now)
        await handleTeacherResponse(userMessage.text);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة' : 
        currentLanguage === 'en' ? 'An error occurred while sending the message' : 
        'پیغام بھیجتے وقت خرابی ہوئی'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIResponse = async (userText: string) => {
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
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        type: 'ai_assistant'
      };

      await addNewMessage(aiMessage);
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback response
      const fallbackMessage: Message = {
        id: `ai-fallback-${Date.now()}`,
        text: currentLanguage === 'ar' ? 'عذراً، لم أستطع فهم سؤالك. يرجى المحاولة مرة أخرى.' :
              currentLanguage === 'en' ? 'Sorry, I couldn\'t understand your question. Please try again.' :
              'معذرت، میں آپ کا سوال سمجھ نہیں سکا۔ براہ کرم دوبارہ کوشش کریں۔',
        sender: 'ai',
        timestamp: new Date(),
        type: 'ai_assistant'
      };
      await addNewMessage(fallbackMessage);
    }
  };

  const handleCustomerServiceResponse = async (userText: string) => {
    // Mock customer service response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const supportMessage: Message = {
      id: `support-${Date.now()}`,
      text: currentLanguage === 'ar' ? 'شكراً لتواصلك معنا. سيتم الرد عليك من قبل فريق الدعم في أقرب وقت.' :
            currentLanguage === 'en' ? 'Thank you for contacting us. You will receive a response from our support team soon.' :
            'ہم سے رابطہ کرنے کا شکریہ۔ آپ کو جلد ہی ہماری سپورٹ ٹیم سے جواب ملے گا۔',
      sender: 'support',
      timestamp: new Date(),
      type: 'customer_service'
    };

    await addNewMessage(supportMessage);
  };

  const handleTeacherResponse = async (userText: string) => {
    // Mock teacher response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const teacherMessage: Message = {
      id: `teacher-${Date.now()}`,
      text: currentLanguage === 'ar' ? `تم إرسال رسالتك إلى ${selectedTeacher?.name[currentLanguage]}. سيقوم بالرد عليك قريباً.` :
            currentLanguage === 'en' ? `Your message has been sent to ${selectedTeacher?.name[currentLanguage]}. They will reply to you soon.` :
            `آپ کا پیغام ${selectedTeacher?.name[currentLanguage]} کو بھیج دیا گیا ہے۔ وہ جلد آپ کو جواب دے گا۔`,
      sender: 'teacher',
      timestamp: new Date(),
      type: 'teacher',
      teacherId: selectedTeacher?.id,
      teacherName: selectedTeacher?.name[currentLanguage]
    };

    await addNewMessage(teacherMessage);
  };

  const getChatTypeColor = (type: string) => {
    switch (type) {
      case 'customer_service': return '#10B981';
      case 'ai_assistant': return '#6366F1';
      case 'teacher': return '#F59E0B';
      default: return currentTheme.primary;
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const messageColor = getChatTypeColor(message.type);

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        <LinearGradient
          colors={isUser 
            ? [currentTheme.primary, currentTheme.primary + 'CC'] 
            : [messageColor + '20', messageColor + '10']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.otherMessageBubble
          ]}
        >
          <Text style={[
            styles.messageText,
            { color: isUser ? '#FFFFFF' : currentTheme.text }
          ]}>
            {message.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isUser ? '#FFFFFF99' : currentTheme.textSecondary }
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </LinearGradient>
      </View>
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
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {texts.messages[currentLanguage]}
        </Text>
      </LinearGradient>

      {/* Chat Type Selector */}
      <View style={[styles.chatSelector, { backgroundColor: currentTheme.surface }]}>
        <TouchableOpacity
          style={[
            styles.chatTypeButton,
            activeChat === 'customer_service' && { backgroundColor: getChatTypeColor('customer_service') + '20' }
          ]}
          onPress={() => handleChatTypeChange('customer_service')}
        >
          <View style={styles.chatTypeButtonContent}>
            <Text style={[
              styles.chatTypeIcon,
              { color: getChatTypeColor('customer_service') }
            ]}>🎧</Text>
            <Text style={[
              styles.chatTypeText,
              { 
                color: activeChat === 'customer_service' ? getChatTypeColor('customer_service') : currentTheme.textSecondary,
                fontWeight: activeChat === 'customer_service' ? '600' : '400'
              }
            ]}>
              {texts.customerService[currentLanguage]}
            </Text>
            {unreadCounts.customer_service > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: getChatTypeColor('customer_service') }]}>
                <Text style={styles.unreadText}>{unreadCounts.customer_service}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chatTypeButton,
            activeChat === 'ai_assistant' && { backgroundColor: getChatTypeColor('ai_assistant') + '20' }
          ]}
          onPress={() => handleChatTypeChange('ai_assistant')}
        >
          <View style={styles.chatTypeButtonContent}>
            <Text style={[
              styles.chatTypeIcon,
              { color: getChatTypeColor('ai_assistant') }
            ]}>🤖</Text>
            <Text style={[
              styles.chatTypeText,
              { 
                color: activeChat === 'ai_assistant' ? getChatTypeColor('ai_assistant') : currentTheme.textSecondary,
                fontWeight: activeChat === 'ai_assistant' ? '600' : '400'
              }
            ]}>
              {texts.aiAssistant[currentLanguage]}
            </Text>
            {unreadCounts.ai_assistant > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: getChatTypeColor('ai_assistant') }]}>
                <Text style={styles.unreadText}>{unreadCounts.ai_assistant}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chatTypeButton,
            activeChat === 'teacher' && { backgroundColor: getChatTypeColor('teacher') + '20' }
          ]}
          onPress={() => handleChatTypeChange('teacher')}
        >
          <View style={styles.chatTypeButtonContent}>
            <Text style={[
              styles.chatTypeIcon,
              { color: getChatTypeColor('teacher') }
            ]}>👨‍🏫</Text>
            
            {/* Teacher name - clickable to change teacher */}
            <TouchableOpacity
              style={styles.teacherNameContainer}
              onPress={() => {
                if (selectedTeacher || activeChat === 'teacher') {
                  setShowTeacherModal(true);
                }
              }}
            >
              <Text style={[
                styles.chatTypeText,
                { 
                  color: activeChat === 'teacher' ? getChatTypeColor('teacher') : currentTheme.textSecondary,
                  fontWeight: activeChat === 'teacher' ? '600' : '400'
                }
              ]}>
                {selectedTeacher ? selectedTeacher.name[currentLanguage] : texts.teacher[currentLanguage]}
              </Text>
              
              {/* Show change indicator when teacher is selected */}
              {selectedTeacher && (
                <Text style={[styles.changeIndicator, { color: getChatTypeColor('teacher') }]}>
                  ⚙️
                </Text>
              )}
            </TouchableOpacity>
            
            {unreadCounts.teacher > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: getChatTypeColor('teacher') }]}>
                <Text style={styles.unreadText}>{unreadCounts.teacher}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Teacher Selection Modal */}
      <Modal
        visible={showTeacherModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTeacherModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.modalContent}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              {texts.chooseTeacher[currentLanguage]}
            </Text>
            
            <FlatList
              data={teachers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.teacherItem, { borderBottomColor: currentTheme.border }]}
                  onPress={() => handleTeacherSelect(item)}
                >
                  <View style={styles.teacherInfo}>
                    <View style={styles.teacherHeader}>
                      <Text style={[styles.teacherName, { color: currentTheme.text }]}>
                        {item.name[currentLanguage]}
                      </Text>
                      <View style={styles.teacherStatus}>
                        <View style={[
                          styles.onlineIndicator,
                          { backgroundColor: item.isOnline ? '#10B981' : '#6B7280' }
                        ]} />
                        <Text style={[
                          styles.statusText,
                          { color: item.isOnline ? '#10B981' : currentTheme.textSecondary }
                        ]}>
                          {item.isOnline ? texts.online[currentLanguage] : texts.offline[currentLanguage]}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.teacherSubject, { color: currentTheme.textSecondary }]}>
                      {item.subject[currentLanguage]}
                    </Text>
                    {item.unreadCount && item.unreadCount > 0 && (
                      <View style={[styles.teacherUnreadBadge, { backgroundColor: getChatTypeColor('teacher') }]}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              style={styles.teachersList}
            />
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: currentTheme.border }]}
              onPress={() => setShowTeacherModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: currentTheme.text }]}>
                {currentLanguage === 'ar' ? 'إلغاء' : currentLanguage === 'en' ? 'Cancel' : 'منسوخ'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={getChatTypeColor(activeChat)} />
            <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
              {currentLanguage === 'ar' ? 'جاري الكتابة...' : 
               currentLanguage === 'en' ? 'Typing...' : 'لکھا جا رہا ہے...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.inputWrapper}
        >
          <TextInput
            style={[
              styles.textInput,
              { 
                color: currentTheme.text,
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.border
              }
            ]}
            placeholder={texts.typeMessage[currentLanguage]}
            placeholderTextColor={currentTheme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: inputText.trim() ? getChatTypeColor(activeChat) : currentTheme.border,
                opacity: isLoading ? 0.5 : 1
              }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {texts.send[currentLanguage]}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chatTypeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chatTypeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    position: 'relative',
  },
  chatTypeIcon: {
    fontSize: 16,
  },
  chatTypeText: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
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
  teachersList: {
    maxHeight: 300,
  },
  teacherItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    position: 'relative',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  teacherStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  teacherSubject: {
    fontSize: 14,
    marginTop: 2,
  },
  teacherUnreadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  teacherNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  changeIndicator: {
    fontSize: 10,
    marginLeft: 4,
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: 'transparent',
  },
  inputWrapper: {
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
  textInput: {
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
});