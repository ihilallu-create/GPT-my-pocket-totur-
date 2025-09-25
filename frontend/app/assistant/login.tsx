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

export default function AssistantLogin() {
  const { login, appSettings } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // النصوص متعددة اللغات
  const texts = {
    title: {
      ar: "تسجيل دخول المساعد",
      en: "Assistant Login", 
      ur: "اسسٹنٹ لاگ ان"
    },
    emailLabel: {
      ar: "البريد الإلكتروني",
      en: "Email",
      ur: "ای میل"
    },
    passwordLabel: {
      ar: "كلمة المرور",
      en: "Password",
      ur: "پاس ورڈ"
    },
    loginButton: {
      ar: "تسجيل الدخول",
      en: "Login",
      ur: "لاگ ان"
    },
    signupLink: {
      ar: "ليس لديك حساب؟ إنشاء حساب",
      en: "Don't have an account? Sign Up",
      ur: "اکاؤنٹ نہیں ہے؟ رجسٹر کریں"
    },
    error: {
      ar: "خطأ في تسجيل الدخول",
      en: "Login failed",
      ur: "لاگ ان ناکام"
    },
    networkError: {
      ar: "خطأ في الشبكة",
      en: "Network error",
      ur: "نیٹ ورک کی خرابی"
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        texts.error[currentLanguage],
        currentLanguage === 'ar' ? 'يرجى ملء جميع الحقول' :
        currentLanguage === 'en' ? 'Please fill all fields' :
        'تمام فیلڈز بھریں'
      );
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assistants/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // استخدام UserContext للمصادقة
        await login({
          isLoggedIn: true,
          userType: 'assistant',
          name: data.name,
          email: data.email,
          id: data.id,
        }, {
          accessToken: data.accessToken,
          tokenType: data.tokenType || 'bearer'
        });

        Alert.alert(
          currentLanguage === 'ar' ? 'مرحباً' : currentLanguage === 'en' ? 'Welcome' : 'خوش آمدید',
          currentLanguage === 'ar' ? 'تم تسجيل الدخول بنجاح' : 
          currentLanguage === 'en' ? 'Login successful' : 
          'کامیابی سے لاگ ان ہو گئے'
        );
        
        router.replace('/assistant/dashboard');
      } else {
        const errorData = await response.json();
        Alert.alert(
          texts.error[currentLanguage],
          errorData.detail || texts.error[currentLanguage]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        texts.networkError[currentLanguage],
        currentLanguage === 'ar' ? 'تحقق من اتصال الإنترنت' :
        currentLanguage === 'en' ? 'Check your internet connection' :
        'انٹرنیٹ کنکشن چیک کریں'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    router.push('/assistant/signup');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={isDarkMode ? ['#F59E0B', '#D97706'] : ['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerIcon}>🤖</Text>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>
              {texts.title[currentLanguage]}
            </Text>
          </LinearGradient>
        </View>

        {/* Login Form */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.formCard}
        >
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.emailLabel[currentLanguage]}
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
              placeholder={texts.emailLabel[currentLanguage]}
              placeholderTextColor={currentTheme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.passwordLabel[currentLanguage]}
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
              placeholder={texts.passwordLabel[currentLanguage]}
              placeholderTextColor={currentTheme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { opacity: loading ? 0.7 : 1 }
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#F59E0B', '#D97706'] : ['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>
                {loading ? '...' : texts.loginButton[currentLanguage]}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={handleSignup}
            activeOpacity={0.7}
          >
            <Text style={[styles.signupText, { color: currentTheme.primary }]}>
              {texts.signupLink[currentLanguage]}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 220,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginTop: 10,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    fontWeight: '600',
  },
});