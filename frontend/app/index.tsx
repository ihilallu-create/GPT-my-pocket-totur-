import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  I18nManager,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../contexts/UserContext";

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  console.log(EXPO_PUBLIC_BACKEND_URL, "EXPO_PUBLIC_BACKEND_URL");

  const { appSettings, changeLanguage, toggleDarkMode } = useUser();
  const currentLanguage = appSettings.currentLanguage;
  const isDarkMode = appSettings.isDarkMode;
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Language data
  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' }
  ];

  // Text content for all languages
  const texts = {
    appTitle: {
      ar: "My Pocket Tutor",
      en: "My Pocket Tutor", 
      ur: "My Pocket Tutor"
    },
    hookLine: {
      ar: "تعلم أذكى، وليس أصعب!",
      en: "Learn Smarter, Not Harder!",
      ur: "ہوشیاری سے سیکھیں، مشکل نہیں!"
    },
    welcomeTitle: {
      ar: "مرحباً بك",
      en: "Welcome", 
      ur: "خوش آمدید"
    },
    description: {
      ar: "يوفر التطبيق مساعد ذكي يتطور بناءً على شخصيتك وأسلوب دراستك، بالإضافة إلى العروض وحجز المواعيد والمزايا الأخرى",
      en: "The app provides an intelligent assistant that evolves based on your personality and study style, plus offers, appointment booking and other features",
      ur: "یہ ایپ ایک ذہین اسسٹنٹ فراہم کرتا ہے جو آپ کی شخصیت اور مطالعے کے انداز کے مطابق ترقی کرتا ہے، علاوہ آفرز، ملاقات کی بکنگ اور دیگر خصوصیات"
    },
    loginButton: {
      ar: "تسجيل الدخول",
      en: "Login",
      ur: "لاگ ان"
    },
    signupButton: {
      ar: "إنشاء حساب",
      en: "Sign Up", 
      ur: "اکاؤنٹ بنائیں"
    }
  };

  const handleLanguageChange = (lang: 'ar' | 'en' | 'ur') => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
    I18nManager.forceRTL(lang === 'ar' || lang === 'ur');
  };

  const getCurrentLanguageFlag = () => {
    const current = languages.find(lang => lang.code === currentLanguage);
    return current ? current.flag : '🇸🇦';
  };

  const handleLogin = () => {
    console.log('Login pressed');
    router.push('/student/login');
  };

  const handleSignup = () => {
    console.log('Signup pressed');
    router.push('/student/signup');
  };

  const handleTeacherLogin = () => {
    console.log('Teacher login pressed');
    router.push('/teacher/login');
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header with Controls */}
      <View style={styles.header}>
        {/* Language Selector */}
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.languageButton, { backgroundColor: currentTheme.surface }]}
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <Text style={styles.languageIcon}>🌐</Text>
            <Text style={styles.languageFlag}>{getCurrentLanguageFlag()}</Text>
          </TouchableOpacity>
          
          {showLanguageDropdown && (
            <View style={[styles.languageDropdown, { backgroundColor: currentTheme.surface }]}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === lang.code && { backgroundColor: currentTheme.primary + '15' }
                  ]}
                  onPress={() => handleLanguageChange(lang.code as 'ar' | 'en' | 'ur')}
                >
                  <Text style={styles.optionFlag}>{lang.flag}</Text>
                  <Text style={[styles.languageName, { color: currentTheme.text }]}>{lang.name}</Text>
                  {currentLanguage === lang.code && (
                    <Text style={[styles.checkMark, { color: currentTheme.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Dark Mode Toggle */}
        <TouchableOpacity
          style={[styles.darkModeToggle, { backgroundColor: currentTheme.surface }]}
          onPress={toggleDarkMode}
        >
          <Text style={styles.themeIcon}>
            {isDarkMode ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.appTitle, { color: currentTheme.text }]}>
            {texts.appTitle[currentLanguage]}
          </Text>
          <View style={[styles.titleUnderline, { backgroundColor: currentTheme.primary }]} />
        </View>

        {/* Hook Line with Gradient */}
        <LinearGradient
          colors={isDarkMode ? ['#8A63D6', '#6366F1'] : ['#D6B9FF', '#8A63D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hookSection}
        >
          <Text style={styles.hookIcon}>🎯</Text>
          <Text style={[styles.hookText, { color: '#FFFFFF' }]}>
            {texts.hookLine[currentLanguage]}
          </Text>
        </LinearGradient>

        {/* Welcome Card with Gradient */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeIcon}>✨</Text>
            <Text style={[styles.welcomeTitle, { color: currentTheme.text }]}>
              {texts.welcomeTitle[currentLanguage]}
            </Text>
          </View>
          <Text style={[styles.descriptionText, { color: currentTheme.textSecondary }]}>
            {texts.description[currentLanguage]}
          </Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginButtonText}>
                {texts.loginButton[currentLanguage]} - طالب
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signupButton, { 
              borderColor: currentTheme.primary,
              backgroundColor: 'transparent'
            }]}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={[styles.signupButtonText, { color: currentTheme.primary }]}>
              {texts.signupButton[currentLanguage]} - طالب
            </Text>
          </TouchableOpacity>

          {/* Teacher Login Button */}
          <TouchableOpacity
            style={styles.teacherButton}
            onPress={handleTeacherLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#10B981', '#06B6D4'] : ['#059669', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.teacherButtonGradient}
            >
              <Text style={styles.teacherButtonText}>
                👨‍🏫 {currentLanguage === 'ar' ? 'دخول المعلم' : 
                       currentLanguage === 'en' ? 'Teacher Login' : 
                       'استاد لاگ ان'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Color schemes based on psychology studies
const lightTheme = {
  background: '#F8FAFC',           // Soft off-white for comfort
  surface: '#FFFFFF',              // Pure white for clarity
  primary: '#4F46E5',             // Indigo for trust and focus
  secondary: '#10B981',           // Emerald for growth and success  
  accent: '#F59E0B',              // Amber for energy and optimism
  text: '#1F2937',                // Dark gray for readability
  textSecondary: '#6B7280',       // Medium gray for secondary content
  border: '#E5E7EB',              // Light gray for subtle borders
};

const darkTheme = {
  background: '#0F172A',           // Deep blue-gray for calm
  surface: '#1E293B',              // Lighter blue-gray for cards
  primary: '#6366F1',             // Brighter indigo for contrast
  secondary: '#10B981',           // Same emerald (works in dark)
  accent: '#F59E0B',              // Same amber (works in dark)
  text: '#F1F5F9',                // Light gray for readability
  textSecondary: '#94A3B8',       // Medium light gray
  border: '#334155',              // Medium gray for borders
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  languageContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  languageFlag: {
    fontSize: 16,
  },
  languageDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    minWidth: 140,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    paddingVertical: 4,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    marginVertical: 1,
    borderRadius: 8,
  },
  optionFlag: {
    fontSize: 18,
  },
  languageName: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkModeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  themeIcon: {
    fontSize: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  hookSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 30,
    marginHorizontal: 10,
  },
  hookIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  hookText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonSection: {
    gap: 16,
    marginTop: 10,
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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signupButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  teacherButton: {
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  teacherButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
