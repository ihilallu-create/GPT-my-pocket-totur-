import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant' | 'ai';
  timestamp: Date;
  senderName?: string;
}

interface ChatType {
  id: string;
  name: { ar: string; en: string; ur: string };
  icon: string;
  type: 'customer_service' | 'ai_assistant' | 'user_chat';
}

export default function AssistantMessages() {
  const { userData, appSettings, getAuthHeaders } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  const [selectedChatType, setSelectedChatType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // أنواع المحادثات - مشابه لـ student/messages.tsx
  const chatTypes: ChatType[] = [
    {
      id: 'customer_service',
      name: {
        ar: 'خدمة العملاء',
        en: 'Customer Service',
        ur: 'کسٹمر سروس'
      },
      icon: '🎧',
      type: 'customer_service'
    },
    {
      id: 'ai_assistant',
      name: {
        ar: 'المساعد الذكي',
        en: 'AI Assistant',
        ur: 'اے آئی اسسٹنٹ'
      },
      icon: '🤖',
      type: 'ai_assistant'
    },
    {
      id: 'students',
      name: {
        ar: 'الطلاب',
        en: 'Students',
        ur: 'طلباء'
      },
      icon: '👨‍🎓',
      type: 'user_chat'
    },
    {
      id: 'teachers',
      name: {
        ar: 'المعلمون',
        en: 'Teachers',
        ur: 'اساتذہ'
      },
      icon: '👨‍🏫',
      type: 'user_chat'
    }
  ];

  // النصوص متعددة اللغات
  const texts = {
    title: {
      ar: "الرسائل",
      en: "Messages",
      ur: "پیغامات"
    },
    selectChat: {
      ar: "اختر نوع المحادثة",
      en: "Select Chat Type",
      ur: "چیٹ کی قسم منتخب کریں"
    },
    selectUser: {
      ar: "اختر المستخدم",
      en: "Select User",
      ur: "صارف منتخب کریں"
    },
    typeMessage: {
      ar: "اكتب رسالة...",
      en: "Type a message...",
      ur: "پیغام ٹائپ کریں..."
    },
    send: {
      ar: "إرسال",
      en: "Send",
      ur: "بھیجیں"
    },
    noMessages: {
      ar: "لا توجد رسائل",
      en: "No messages",
      ur: "کوئی پیغام نہیں"
    },
    back: {
      ar: "رجوع",
      en: "Back",
      ur: "واپس"
    }
  };

  useEffect(() => {
    if (selectedChatType === 'students' || selectedChatType === 'teachers') {
      loadUsers();
    }
  }, [selectedChatType]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const endpoint = selectedChatType === 'students' ? '/api/students' : '/api/teachers';
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      let endpoint = '';
      if (selectedChatType === 'customer_service') {
        endpoint = '/api/messages/customer-service';
      } else if (selectedChatType === 'ai_assistant') {
        endpoint = '/api/messages/ai-assistant';
      } else if (selectedUser) {
        endpoint = `/api/messages/conversation/${selectedUser}`;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || msg.created_at)
        })));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      senderName: userData.name || 'أنت'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    try {
      let endpoint = '';
      let payload: any = {
        message: newMessage.text,
        sender_id: userData.id,
        sender_type: 'assistant'
      };

      if (selectedChatType === 'customer_service') {
        endpoint = '/api/messages/customer-service';
      } else if (selectedChatType === 'ai_assistant') {
        endpoint = '/api/ai-chat';
        payload = { message: newMessage.text };
      } else if (selectedUser) {
        endpoint = '/api/messages';
        payload.receiver_id = selectedUser;
        payload.receiver_type = selectedChatType === 'students' ? 'student' : 'teacher';
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok && selectedChatType === 'ai_assistant') {
        const aiResponse = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.response || 'عذراً، لم أتمكن من فهم طلبك.',
          sender: 'ai',
          timestamp: new Date(),
          senderName: 'المساعد الذكي'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderChatTypeSelection = () => (
    <View style={styles.chatTypeContainer}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
        {texts.selectChat[currentLanguage]}
      </Text>
      
      <View style={styles.chatTypesGrid}>
        {chatTypes.map((chatType) => (
          <TouchableOpacity
            key={chatType.id}
            style={[
              styles.chatTypeCard,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }
            ]}
            onPress={() => setSelectedChatType(chatType.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.chatTypeCardGradient}
            >
              <Text style={styles.chatTypeIcon}>{chatType.icon}</Text>
              <Text style={[styles.chatTypeName, { color: currentTheme.text }]}>
                {chatType.name[currentLanguage]}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUserSelection = () => (
    <View style={styles.userSelectionContainer}>
      <View style={styles.backHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedChatType(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: currentTheme.primary }]}>
            {currentLanguage === 'ar' ? '→' : '←'}
          </Text>
          <Text style={[styles.backText, { color: currentTheme.primary }]}>
            {texts.back[currentLanguage]}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
        {texts.selectUser[currentLanguage]}
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.userCard,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }
            ]}
            onPress={() => setSelectedUser(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.userAvatar, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.userInitial}>
                {(item.name || item.studentName || 'U').charAt(0)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: currentTheme.text }]}>
                {item.name || item.studentName || 'مستخدم'}
              </Text>
              <Text style={[styles.userEmail, { color: currentTheme.textSecondary }]}>
                {item.email}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <LinearGradient
          colors={
            isCurrentUser
              ? [currentTheme.primary, currentTheme.primary + 'CC']
              : isDarkMode 
                ? ['#374151', '#4B5563'] 
                : ['#F3F4F6', '#E5E7EB']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.messageBubble}
        >
          <Text style={[
            styles.messageText,
            { color: isCurrentUser ? '#FFFFFF' : currentTheme.text }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isCurrentUser ? '#FFFFFF99' : currentTheme.textSecondary }
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderChat = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <View style={[styles.chatHeader, { backgroundColor: currentTheme.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setSelectedUser(null);
            setMessages([]);
            if (selectedChatType === 'students' || selectedChatType === 'teachers') {
              // Stay in user selection
            } else {
              setSelectedChatType(null);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: currentTheme.primary }]}>
            {currentLanguage === 'ar' ? '→' : '←'}
          </Text>
        </TouchableOpacity>

        <View style={styles.chatHeaderInfo}>
          <Text style={[styles.chatHeaderTitle, { color: currentTheme.text }]}>
            {selectedChatType && chatTypes.find(ct => ct.id === selectedChatType)?.name[currentLanguage]}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
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
          placeholder={texts.typeMessage[currentLanguage]}
          placeholderTextColor={currentTheme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: inputText.trim() ? currentTheme.primary : currentTheme.border,
              opacity: inputText.trim() ? 1 : 0.5 
            }
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>
            {texts.send[currentLanguage]}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
          style={styles.headerBackButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: currentTheme.primary }]}>
            {currentLanguage === 'ar' ? '→' : '←'}
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {texts.title[currentLanguage]}
        </Text>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {!selectedChatType ? (
          renderChatTypeSelection()
        ) : (selectedChatType === 'students' || selectedChatType === 'teachers') && !selectedUser ? (
          renderUserSelection()
        ) : (
          renderChat()
        )}
      </View>
    </SafeAreaView>
  );
}

// نفس الألوان من التطبيق الحالي
const lightTheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#F59E0B',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#F59E0B',
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
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  chatTypeContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  chatTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  chatTypeCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chatTypeCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  chatTypeIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  chatTypeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  userSelectionContainer: {
    flex: 1,
    padding: 20,
  },
  backHeader: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});