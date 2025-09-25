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

export default function StudentSignup() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en' | 'ur'>('ar');
  const { setUserData } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    studentName: '',
    phoneNumber: '',
    email: '',
    universityName: '',
    universityId: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Text content for all languages
  const texts = {
    title: {
      ar: "إنشاء حساب طالب",
      en: "Create Student Account",
      ur: "طالب علم کا اکاؤنٹ بنائیں"
    },
    subtitle: {
      ar: "أدخل معلوماتك لإنشاء حساب جديد",
      en: "Enter your information to create a new account",
      ur: "نیا اکاؤنٹ بنانے کے لیے اپنی معلومات درج کریں"
    },
    studentName: {
      ar: "اسم الطالب",
      en: "Student Name",
      ur: "طالب علم کا نام"
    },
    phoneNumber: {
      ar: "رقم الجوال",
      en: "Phone Number",
      ur: "فون نمبر"
    },
    email: {
      ar: "البريد الإلكتروني",
      en: "Email",
      ur: "ای میل"
    },
    universityName: {
      ar: "اسم الجامعة",
      en: "University Name",
      ur: "یونیورسٹی کا نام"
    },
    universityId: {
      ar: "الرقم الجامعي",
      en: "University ID",
      ur: "یونیورسٹی آئی ڈی"
    },
    password: {
      ar: "كلمة السر",
      en: "Password",
      ur: "پاس ورڈ"
    },
    confirmPassword: {
      ar: "تأكيد كلمة السر",
      en: "Confirm Password",
      ur: "پاس ورڈ کی تصدیق"
    },
    createAccount: {
      ar: "إنشاء حساب",
      en: "Create Account",
      ur: "اکاؤنٹ بنائیں"
    },
    backToLogin: {
      ar: "العودة لتسجيل الدخول",
      en: "Back to Login",
      ur: "لاگ ان پر واپس"
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
    },
    invalidPhone: {
      ar: "رقم الجوال غير صحيح",
      en: "Invalid phone number",
      ur: "غلط فون نمبر"
    },
    passwordTooShort: {
      ar: "كلمة السر يجب أن تكون 6 أحرف على الأقل",
      en: "Password must be at least 6 characters",
      ur: "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے"
    },
    passwordMismatch: {
      ar: "كلمتا السر غير متطابقتين",
      en: "Passwords do not match",
      ur: "پاس ورڈ میں عدم مطابقت"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate student name
    if (!formData.studentName.trim()) {
      newErrors.studentName = texts.required[currentLanguage];
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = texts.required[currentLanguage];
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = texts.invalidPhone[currentLanguage];
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = texts.required[currentLanguage];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = texts.invalidEmail[currentLanguage];
    }

    // Validate university name
    if (!formData.universityName.trim()) {
      newErrors.universityName = texts.required[currentLanguage];
    }

    // Validate university ID
    if (!formData.universityId.trim()) {
      newErrors.universityId = texts.required[currentLanguage];
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = texts.required[currentLanguage];
    } else if (formData.password.length < 6) {
      newErrors.password = texts.passwordTooShort[currentLanguage];
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = texts.required[currentLanguage];
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = texts.passwordMismatch[currentLanguage];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to create student account
      console.log('Creating student account:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save user data to context
      setUserData({
        studentName: formData.studentName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        universityName: formData.universityName,
        universityId: formData.universityId,
        joinDate: new Date().toISOString().split('T')[0],
        isLoggedIn: true,
      });
      
      Alert.alert(
        currentLanguage === 'ar' ? 'نجح التسجيل' : 
        currentLanguage === 'en' ? 'Registration Successful' : 'رجسٹریشن کامیاب',
        currentLanguage === 'ar' ? 'تم إنشاء حسابك بنجاح' : 
        currentLanguage === 'en' ? 'Your account has been created successfully' : 'آپ کا اکاؤنٹ کامیابی سے بن گیا ہے'
      );
      
      // Navigate to student dashboard
      router.replace('/student/dashboard');
      
    } catch (error) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : 
        currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 
        currentLanguage === 'en' ? 'An error occurred while creating the account' : 'اکاؤنٹ بناتے وقت خرابی ہوئی'
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
            {/* Student Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.studentName[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.studentName ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.studentName}
                onChangeText={(value) => handleInputChange('studentName', value)}
                placeholder={texts.studentName[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.studentName ? (
                <Text style={styles.errorText}>{errors.studentName}</Text>
              ) : null}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.phoneNumber[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.phoneNumber ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder={texts.phoneNumber[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                keyboardType="phone-pad"
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.phoneNumber ? (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              ) : null}
            </View>

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

            {/* University Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.universityName[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.universityName ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.universityName}
                onChangeText={(value) => handleInputChange('universityName', value)}
                placeholder={texts.universityName[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.universityName ? (
                <Text style={styles.errorText}>{errors.universityName}</Text>
              ) : null}
            </View>

            {/* University ID */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.universityId[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.universityId ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.universityId}
                onChangeText={(value) => handleInputChange('universityId', value)}
                placeholder={texts.universityId[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.universityId ? (
                <Text style={styles.errorText}>{errors.universityId}</Text>
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.confirmPassword[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.confirmPassword ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder={texts.confirmPassword[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                secureTextEntry={true}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDarkMode ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonGradient}
              >
                <Text style={styles.createButtonText}>
                  {isLoading ? '...' : texts.createAccount[currentLanguage]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.backToLoginButton, { 
                borderColor: currentTheme.primary,
                backgroundColor: 'transparent'
              }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={[styles.backToLoginButtonText, { color: currentTheme.primary }]}>
                {texts.backToLogin[currentLanguage]}
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
    marginBottom: 32,
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
  buttonSection: {
    gap: 16,
  },
  createButton: {
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  createButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backToLoginButton: {
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
  backToLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});