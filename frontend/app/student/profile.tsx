import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { userData, appSettings, updateProfile, logout, toggleDarkMode, changeLanguage } = useUser();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  // Get theme and language from global context
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for avatar
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Student profile data from context
  const [profileData, setProfileData] = useState({
    studentName: userData.studentName || '',
    phoneNumber: userData.phoneNumber || '',
    email: userData.email || '',
    universityName: userData.universityName || '',
    universityId: userData.universityId || '',
    joinDate: userData.joinDate || ''
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Language options
  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' }
  ];

  // Text content for all languages
  const texts = {
    title: {
      ar: "المعلومات الشخصية",
      en: "Personal Information",
      ur: "ذاتی معلومات"
    },
    edit: {
      ar: "تعديل",
      en: "Edit",
      ur: "ترمیم"
    },
    save: {
      ar: "حفظ",
      en: "Save",
      ur: "محفوظ کریں"
    },
    cancel: {
      ar: "إلغاء",
      en: "Cancel",
      ur: "منسوخ"
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
    joinDate: {
      ar: "تاريخ الانضمام",
      en: "Join Date",
      ur: "شمولیت کی تاریخ"
    },
    settings: {
      ar: "الإعدادات",
      en: "Settings",
      ur: "ترتیبات"
    },
    language: {
      ar: "اللغة",
      en: "Language",
      ur: "زبان"
    },
    darkMode: {
      ar: "النمط الليلي",
      en: "Dark Mode",
      ur: "رات کا موڈ"
    },
    logout: {
      ar: "تسجيل الخروج",
      en: "Logout",
      ur: "لاگ آؤٹ"
    },
    changePassword: {
      ar: "تغيير كلمة السر",
      en: "Change Password",
      ur: "پاس ورڈ تبدیل کریں"
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
    saveSuccess: {
      ar: "تم حفظ التغييرات بنجاح",
      en: "Changes saved successfully",
      ur: "تبدیلیاں کامیابی سے محفوظ ہوگئیں"
    },
    logoutConfirm: {
      ar: "هل أنت متأكد من تسجيل الخروج؟",
      en: "Are you sure you want to logout?",
      ur: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!editData.studentName.trim()) {
      newErrors.studentName = texts.required[currentLanguage];
    }

    if (!editData.phoneNumber.trim()) {
      newErrors.phoneNumber = texts.required[currentLanguage];
    } else if (!/^[0-9+\-\s()]+$/.test(editData.phoneNumber)) {
      newErrors.phoneNumber = texts.invalidPhone[currentLanguage];
    }

    if (!editData.email.trim()) {
      newErrors.email = texts.required[currentLanguage];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = texts.invalidEmail[currentLanguage];
    }

    if (!editData.universityName.trim()) {
      newErrors.universityName = texts.required[currentLanguage];
    }

    if (!editData.universityId.trim()) {
      newErrors.universityId = texts.required[currentLanguage];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: API call to update profile
      setProfileData({ ...editData });
      
      // Update context with new data
      updateProfile({
        studentName: editData.studentName,
        phoneNumber: editData.phoneNumber,
        email: editData.email,
        universityName: editData.universityName,
        universityId: editData.universityId,
      });
      
      setIsEditing(false);
      Alert.alert(
        currentLanguage === 'ar' ? 'نجح الحفظ' : 
        currentLanguage === 'en' ? 'Success' : 'کامیابی',
        texts.saveSuccess[currentLanguage]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
    setErrors({});
  };

  const handleLanguageChange = (lang: 'ar' | 'en' | 'ur') => {
    changeLanguage(lang);
  };

  const handleLogout = () => {
    Alert.alert(
      texts.logout[currentLanguage],
      texts.logoutConfirm[currentLanguage],
      [
        {
          text: texts.cancel[currentLanguage],
          style: 'cancel'
        },
        {
          text: texts.logout[currentLanguage],
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };


  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? ['#4F46E5', '#7C3AED', '#EC4899'] : ['#6366F1', '#8B5CF6', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            <Animated.View
              style={[
                styles.avatarContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { 
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF6347']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {profileData.studentName ? profileData.studentName.charAt(0).toUpperCase() : 'S'}
                </Text>
              </LinearGradient>
            </Animated.View>
            
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>
              {texts.title[currentLanguage]}
            </Text>
            <Text style={[styles.headerSubtitle, { color: '#FFFFFF99' }]}>
              {profileData.studentName || 'الطالب'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.profileImageContainer}
          >
            <Text style={styles.profileImageText}>
              {profileData.studentName.charAt(0)}
            </Text>
          </LinearGradient>
        </View>

        {/* Edit Button */}
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: isEditing ? currentTheme.primary : 'transparent' }]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={[
              styles.editButtonText, 
              { color: isEditing ? '#FFFFFF' : currentTheme.primary }
            ]}>
              {isEditing ? texts.cancel[currentLanguage] : texts.edit[currentLanguage]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.infoCard}
        >
          {/* Student Name */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {texts.studentName[currentLanguage]}
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.studentName ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={editData.studentName}
                onChangeText={(value) => handleInputChange('studentName', value)}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
            ) : (
              <Text style={[styles.value, { color: currentTheme.textSecondary }]}>
                {profileData.studentName}
              </Text>
            )}
            {errors.studentName ? (
              <Text style={styles.errorText}>{errors.studentName}</Text>
            ) : null}
          </View>

          {/* Phone Number */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {texts.phoneNumber[currentLanguage]}
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.phoneNumber ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={editData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
            ) : (
              <Text style={[styles.value, { color: currentTheme.textSecondary }]}>
                {profileData.phoneNumber}
              </Text>
            )}
            {errors.phoneNumber ? (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {texts.email[currentLanguage]}
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.email ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={editData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
            ) : (
              <Text style={[styles.value, { color: currentTheme.textSecondary }]}>
                {profileData.email}
              </Text>
            )}
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* University Name */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {texts.universityName[currentLanguage]}
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.universityName ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={editData.universityName}
                onChangeText={(value) => handleInputChange('universityName', value)}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
            ) : (
              <Text style={[styles.value, { color: currentTheme.textSecondary }]}>
                {profileData.universityName}
              </Text>
            )}
            {errors.universityName ? (
              <Text style={styles.errorText}>{errors.universityName}</Text>
            ) : null}
          </View>

          {/* University ID */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {texts.universityId[currentLanguage]}
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.universityId ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={editData.universityId}
                onChangeText={(value) => handleInputChange('universityId', value)}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
            ) : (
              <Text style={[styles.value, { color: currentTheme.textSecondary }]}>
                {profileData.universityId}
              </Text>
            )}
            {errors.universityId ? (
              <Text style={styles.errorText}>{errors.universityId}</Text>
            ) : null}
          </View>

          {/* Join Date (Read-only) */}
          <View style={styles.infoItem}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              {texts.joinDate[currentLanguage]}
            </Text>
            <Text style={[styles.value, { color: currentTheme.textSecondary }]}>
              {profileData.joinDate}
            </Text>
          </View>
        </LinearGradient>

        {/* Save Button (when editing) */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDarkMode ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {texts.save[currentLanguage]}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Settings Section */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.settingsCard}
        >
          <Text style={[styles.settingsTitle, { color: currentTheme.text }]}>
            {texts.settings[currentLanguage]}
          </Text>

          {/* Language Setting */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>
              {texts.language[currentLanguage]}
            </Text>
            <View style={styles.languageContainer}>
              <View style={styles.horizontalLanguageButtons}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageChip,
                      { 
                        backgroundColor: currentLanguage === lang.code 
                          ? currentTheme.primary 
                          : currentTheme.background,
                        borderColor: currentLanguage === lang.code 
                          ? currentTheme.primary 
                          : currentTheme.border
                      }
                    ]}
                    onPress={() => handleLanguageChange(lang.code as 'ar' | 'en' | 'ur')}
                  >
                    <Text style={styles.languageChipFlag}>{lang.flag}</Text>
                    <Text style={[
                      styles.languageChipText, 
                      { 
                        color: currentLanguage === lang.code 
                          ? '#FFFFFF' 
                          : currentTheme.text 
                      }
                    ]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Dark Mode Setting */}
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>
              {texts.darkMode[currentLanguage]}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Change Password */}
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/student/change-password')}
          >
            <Text style={[styles.settingLabel, { color: currentTheme.text }]}>
              {texts.changePassword[currentLanguage]}
            </Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: '#EF4444' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>
            {texts.logout[currentLanguage]}
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  editButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImageText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    textAlign: 'right',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  settingsCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  settingArrow: {
    fontSize: 18,
    color: '#6B7280',
  },
  languageContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  horizontalLanguageButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageChipFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  avatarContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -30,
    zIndex: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
});