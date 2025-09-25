import React, { useState } from "react";
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function StudentLogin() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en' | 'ur'>('ar');
  const { login } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Text content for all languages
  const texts = {
    title: {
      ar: "تسجيل دخول الطالب",
      en: "Student Login",
      ur: "طالب علم کا لاگ ان"
    },
    subtitle: {
      ar: "أدخل بياناتك للدخول إلى حسابك",
      en: "Enter your credentials to access your account",
      ur: "اپنے اکاؤنٹ میں داخل ہونے کے لیے اپنی معلومات درج کریں"
    },
    email: {
      ar: "البريد الإلكتروني",
      en: "Email",
      ur: "ای میل"
    },
    password: {
      ar: "كلمة السر",
      en: "Password",
      ur: "پاس ورڈ"
    },
    login: {
      ar: "تسجيل الدخول",
      en: "Login",
      ur: "لاگ ان"
    },
    createAccount: {
      ar: "إنشاء حساب جديد",
      en: "Create New Account",
      ur: "نیا اکاؤنٹ بنائیں"
    },
    forgotPassword: {
      ar: "نسيت كلمة السر؟",
      en: "Forgot Password?",
      ur: "پاس ورڈ بھول گئے؟"
    },
    required: {
      ar: "هذا الحقل مطلوب",
      en: "This field is required",
      ur: "یہ فیلڈ ضروری ہے"
    },
    invalidEmail: {
      ar: "البريد الإلكتروني غير صحيح",
      en: "Invalid email format",
      ur: "غلط ای میل فارمیٹ"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = texts.required[currentLanguage];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = texts.invalidEmail[currentLanguage];
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = texts.required[currentLanguage];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call for login
      console.log('Logging in student:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, simulate user data from login
      // In real app, this would come from API response
      login({
        email: formData.email,
        studentName: 'مستخدم تجريبي', // Default name for demo
        phoneNumber: '+966501234567',
        universityName: 'جامعة افتراضية',
        universityId: '12345',
        joinDate: '2024-01-15',
      });
      
      // Navigate to student dashboard
      router.replace('/student/dashboard');
      
    } catch (error) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : 
        currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'البريد الإلكتروني أو كلمة السر غير صحيحة' : 
        currentLanguage === 'en' ? 'Invalid email or password' : 'غلط ای میل یا پاس ورڈ'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: currentTheme.surface }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backIcon, { color: currentTheme.text }]}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              {texts.title[currentLanguage]}
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
              {texts.subtitle[currentLanguage]}
            </Text>
          </View>

          {/* Form Card */}
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.formCard}
          >
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.email[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.email ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder={texts.email[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.password[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.password ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder={texts.password[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                secureTextEntry={true}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: currentTheme.primary }]}>
                {texts.forgotPassword[currentLanguage]}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDarkMode ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? '...' : texts.login[currentLanguage]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createAccountButton, { 
                borderColor: currentTheme.primary,
                backgroundColor: 'transparent'
              }]}
              onPress={() => router.push('/student/signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.createAccountButtonText, { color: currentTheme.primary }]}>
                {texts.createAccount[currentLanguage]}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 12,
    marginBottom: 20,
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
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonSection: {
    gap: 16,
  },
  loginButton: {
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  createAccountButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});