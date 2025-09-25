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

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function TeacherSignup() {
  const { appSettings } = useUser();
  const currentLanguage = appSettings.currentLanguage;
  const isDarkMode = appSettings.isDarkMode;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    university_name: '',
    years_experience: '',
    gpa: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Text content for all languages
  const texts = {
    title: {
      ar: "إنشاء حساب معلم",
      en: "Create Teacher Account", 
      ur: "استاد اکاؤنٹ بنائیں"
    },
    nameLabel: {
      ar: "الاسم الكامل",
      en: "Full Name",
      ur: "مکمل نام"
    },
    phoneLabel: {
      ar: "رقم الهاتف",
      en: "Phone Number",
      ur: "فون نمبر"
    },
    emailLabel: {
      ar: "البريد الإلكتروني",
      en: "Email",
      ur: "ای میل"
    },
    universityLabel: {
      ar: "اسم الجامعة",
      en: "University Name",
      ur: "یونیورسٹی کا نام"
    },
    experienceLabel: {
      ar: "سنوات الخبرة",
      en: "Years of Experience",
      ur: "تجربے کے سال"
    },
    gpaLabel: {
      ar: "المعدل التراكمي",
      en: "GPA",
      ur: "جی پی اے"
    },
    passwordLabel: {
      ar: "كلمة المرور",
      en: "Password",
      ur: "پاس ورڈ"
    },
    confirmPasswordLabel: {
      ar: "تأكيد كلمة المرور",
      en: "Confirm Password",
      ur: "پاس ورڈ کی تصدیق"
    },
    signupButton: {
      ar: "إنشاء الحساب",
      en: "Create Account",
      ur: "اکاؤنٹ بنائیں"
    },
    loginLink: {
      ar: "لديك حساب؟ تسجيل الدخول",
      en: "Have an account? Login",
      ur: "اکاؤنٹ ہے؟ لاگ ان"
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى إدخال الاسم الكامل' : 
        currentLanguage === 'en' ? 'Please enter full name' : 
        'مکمل نام درج کریں'
      );
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى إدخال رقم الهاتف' : 
        currentLanguage === 'en' ? 'Please enter phone number' : 
        'فون نمبر درج کریں'
      );
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 
        currentLanguage === 'en' ? 'Please enter a valid email' : 
        'درست ای میل درج کریں'
      );
      return false;
    }

    if (!formData.university_name.trim()) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى إدخال اسم الجامعة' : 
        currentLanguage === 'en' ? 'Please enter university name' : 
        'یونیورسٹی کا نام درج کریں'
      );
      return false;
    }

    const experience = parseInt(formData.years_experience);
    if (isNaN(experience) || experience < 0) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى إدخال سنوات خبرة صحيحة' : 
        currentLanguage === 'en' ? 'Please enter valid years of experience' : 
        'درست تجربے کے سال درج کریں'
      );
      return false;
    }

    const gpa = parseFloat(formData.gpa);
    if (isNaN(gpa) || gpa < 0 || gpa > 5) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يرجى إدخال معدل تراكمي بين 0 و 5' : 
        currentLanguage === 'en' ? 'Please enter GPA between 0 and 5' : 
        '0 سے 5 کے درمیان جی پی اے درج کریں'
      );
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 
        currentLanguage === 'en' ? 'Password must be at least 8 characters' : 
        'پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے'
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'كلمات المرور غير متطابقة' : 
        currentLanguage === 'en' ? 'Passwords do not match' : 
        'پاس ورڈ میچ نہیں کرتے'
      );
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const signupData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        university_name: formData.university_name.trim(),
        years_experience: parseInt(formData.years_experience),
        gpa: parseFloat(formData.gpa),
        password: formData.password
      };

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/teachers/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        Alert.alert(
          currentLanguage === 'ar' ? 'تم بنجاح' : currentLanguage === 'en' ? 'Success' : 'کامیاب',
          currentLanguage === 'ar' ? 'تم إنشاء الحساب بنجاح' : 
          currentLanguage === 'en' ? 'Account created successfully' : 
          'اکاؤنٹ کامیابی سے بنایا گیا',
          [
            {
              text: currentLanguage === 'ar' ? 'حسناً' : currentLanguage === 'en' ? 'OK' : 'ٹھیک ہے',
              onPress: () => router.replace('/teacher/login')
            }
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert(
          currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
          errorData.detail || 
          (currentLanguage === 'ar' ? 'فشل في إنشاء الحساب' : 
           currentLanguage === 'en' ? 'Failed to create account' : 
           'اکاؤنٹ بنانے میں ناکام')
        );
      }
    } catch (error) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ في الشبكة' : currentLanguage === 'en' ? 'Network Error' : 'نیٹ ورک کی خرابی',
        currentLanguage === 'ar' ? 'تحقق من اتصال الإنترنت' : 
        currentLanguage === 'en' ? 'Check your internet connection' : 
        'انٹرنیٹ کنکشن چیک کریں'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/teacher/login');
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
            colors={isDarkMode ? ['#10B981', '#06B6D4'] : ['#059669', '#0891B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerIcon}>👨‍🎓</Text>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>
              {texts.title[currentLanguage]}
            </Text>
          </LinearGradient>
        </View>

        {/* Signup Form */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.formCard}
        >
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.nameLabel[currentLanguage]}
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
              placeholder={texts.nameLabel[currentLanguage]}
              placeholderTextColor={currentTheme.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoComplete="name"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.phoneLabel[currentLanguage]}
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
              placeholder={texts.phoneLabel[currentLanguage]}
              placeholderTextColor={currentTheme.textSecondary}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Email */}
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
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* University */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.universityLabel[currentLanguage]}
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
              placeholder={texts.universityLabel[currentLanguage]}
              placeholderTextColor={currentTheme.textSecondary}
              value={formData.university_name}
              onChangeText={(value) => updateFormData('university_name', value)}
            />
          </View>

          {/* Years of Experience */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.experienceLabel[currentLanguage]}
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
              placeholder="0"
              placeholderTextColor={currentTheme.textSecondary}
              value={formData.years_experience}
              onChangeText={(value) => updateFormData('years_experience', value)}
              keyboardType="numeric"
            />
          </View>

          {/* GPA */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.gpaLabel[currentLanguage]} (0-5)
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
              placeholder="3.0"
              placeholderTextColor={currentTheme.textSecondary}
              value={formData.gpa}
              onChangeText={(value) => updateFormData('gpa', value)}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Password */}
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
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: currentTheme.text }]}>
              {texts.confirmPasswordLabel[currentLanguage]}
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
              placeholder={texts.confirmPasswordLabel[currentLanguage]}
              placeholderTextColor={currentTheme.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#10B981', '#06B6D4'] : ['#059669', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signupButtonGradient}
            >
              <Text style={styles.signupButtonText}>
                {loading ? '...' : texts.signupButton[currentLanguage]}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={[styles.loginText, { color: currentTheme.primary }]}>
              {texts.loginLink[currentLanguage]}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

// استخدام نفس الألوان من dashboard.tsx
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 250,
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  signupButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginTop: 20,
  },
  signupButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '600',
  },
});