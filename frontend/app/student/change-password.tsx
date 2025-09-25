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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function ChangePassword() {
  const { appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Text content for all languages
  const texts = {
    title: {
      ar: "تغيير كلمة السر",
      en: "Change Password",
      ur: "پاس ورڈ تبدیل کریں"
    },
    currentPassword: {
      ar: "كلمة السر الحالية",
      en: "Current Password",
      ur: "موجودہ پاس ورڈ"
    },
    newPassword: {
      ar: "كلمة السر الجديدة",
      en: "New Password",
      ur: "نیا پاس ورڈ"
    },
    confirmPassword: {
      ar: "تأكيد كلمة السر",
      en: "Confirm Password",
      ur: "پاس ورڈ کی تصدیق"
    },
    update: {
      ar: "تحديث",
      en: "Update",
      ur: "اپ ڈیٹ"
    },
    cancel: {
      ar: "إلغاء",
      en: "Cancel",
      ur: "منسوخ"
    },
    required: {
      ar: "هذا الحقل مطلوب",
      en: "This field is required",
      ur: "یہ فیلڈ ضروری ہے"
    },
    passwordTooShort: {
      ar: "كلمة السر يجب أن تكون 6 أحرف على الأقل",
      en: "Password must be at least 6 characters",
      ur: "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے"
    },
    passwordsNotMatch: {
      ar: "كلمات السر غير متطابقة",
      en: "Passwords do not match",
      ur: "پاس ورڈ میل نہیں کھاتے"
    },
    updateSuccess: {
      ar: "تم تحديث كلمة السر بنجاح",
      en: "Password updated successfully",
      ur: "پاس ورڈ کامیابی سے اپ ڈیٹ ہوگیا"
    },
    passwordRequirements: {
      ar: "يجب أن تحتوي كلمة السر على 6 أحرف على الأقل",
      en: "Password must contain at least 6 characters",
      ur: "پاس ورڈ میں کم از کم 6 حروف ہونے چاہیئں"
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = texts.required[currentLanguage];
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = texts.required[currentLanguage];
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = texts.passwordTooShort[currentLanguage];
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = texts.required[currentLanguage];
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = texts.passwordsNotMatch[currentLanguage];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API call to update password
      // await updatePasswordAPI(formData.currentPassword, formData.newPassword);
      
      Alert.alert(
        currentLanguage === 'ar' ? 'نجح التحديث' : 
        currentLanguage === 'en' ? 'Success' : 'کامیابی',
        texts.updateSuccess[currentLanguage],
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : 
        currentLanguage === 'en' ? 'Error' : 'خرابی',
        currentLanguage === 'ar' ? 'حدث خطأ في تحديث كلمة السر' :
        currentLanguage === 'en' ? 'Error updating password' : 'پاس ورڈ اپ ڈیٹ کرنے میں خرابی'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Form */}
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.formCard}
          >
            {/* Password Requirements Info */}
            <View style={[styles.infoBox, { backgroundColor: currentTheme.primary + '15' }]}>
              <Text style={[styles.infoText, { color: currentTheme.primary }]}>
                {texts.passwordRequirements[currentLanguage]}
              </Text>
            </View>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.currentPassword[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.currentPassword ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                secureTextEntry
                placeholder={texts.currentPassword[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.currentPassword ? (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              ) : null}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.text }]}>
                {texts.newPassword[currentLanguage]}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: currentTheme.background,
                    borderColor: errors.newPassword ? '#EF4444' : currentTheme.border,
                    color: currentTheme.text
                  }
                ]}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                secureTextEntry
                placeholder={texts.newPassword[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.newPassword ? (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
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
                secureTextEntry
                placeholder={texts.confirmPassword[currentLanguage]}
                placeholderTextColor={currentTheme.textSecondary}
                textAlign={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'right' : 'left'}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Update Button */}
            <TouchableOpacity
              style={[styles.updateButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleUpdatePassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isDarkMode ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.updateButtonGradient}
              >
                <Text style={styles.updateButtonText}>
                  {isLoading ? '...' : texts.update[currentLanguage]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: currentTheme.border }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: currentTheme.textSecondary }]}>
                {texts.cancel[currentLanguage]}
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
  keyboardAvoidingView: {
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
  placeholder: {
    width: 40,
  },
  formCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  updateButton: {
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  updateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});