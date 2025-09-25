// 🎯 ملف Profile للمساعد - /app/frontend/app/assistant/profile.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function AssistantProfile() {
  const { userData, appSettings, getAuthHeaders, updateProfile, logout } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    specialization: userData.specialization || '',
    experience: userData.experience?.toString() || '0',
  });

  // ✅ النصوص بـ useMemo
  const texts = useMemo(() => ({
    title: { ar: "الملف الشخصي", en: "Profile", ur: "پروفائل" },
    name: { ar: "الاسم", en: "Name", ur: "نام" },
    email: { ar: "البريد الإلكتروني", en: "Email", ur: "ای میل" },
    specialization: { ar: "التخصص", en: "Specialization", ur: "تخصص" },
    experience: { ar: "سنوات الخبرة", en: "Years of Experience", ur: "تجربے کے سال" },
    edit: { ar: "تعديل", en: "Edit", ur: "ترمیم" },
    save: { ar: "حفظ", en: "Save", ur: "محفوظ کریں" },
    cancel: { ar: "إلغاء", en: "Cancel", ur: "منسوخ" },
    logout: { ar: "تسجيل الخروج", en: "Logout", ur: "لاگ آؤٹ" },
    back: { ar: "رجوع", en: "Back", ur: "واپس" },
    saveSuccess: { ar: "تم حفظ التغييرات بنجاح", en: "Changes saved successfully", ur: "تبدیلیاں کامیابی سے محفوظ ہو گئیں" },
    saveError: { ar: "فشل في حفظ التغييرات", en: "Failed to save changes", ur: "تبدیلیاں محفوظ کرنے میں ناکام" },
    logoutConfirm: { ar: "هل أنت متأكد من تسجيل الخروج؟", en: "Are you sure you want to logout?", ur: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟" },
    validationError: { ar: "يرجى ملء جميع الحقول المطلوبة", en: "Please fill all required fields", ur: "تمام ضروری فیلڈز بھریں" },
    loadError: { ar: "فشل تحميل البيانات", en: "Failed to load data", ur: "ڈیٹا لوڈ نہیں ہوا" },
  }), []);

  // ✅ تحميل بيانات الملف الشخصي
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assistants/profile`,
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // تحديث البيانات المحلية
      const profileData = {
        name: data.name || '',
        email: data.email || '',
        specialization: data.specialization || '',
        experience: data.experience?.toString() || '0',
      };
      
      setFormData(profileData);
      
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        texts.loadError[currentLanguage]
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, texts, currentLanguage]);

  // ✅ حفظ التغييرات
  const handleSave = useCallback(async () => {
    // التحقق من صحة البيانات
    if (!formData.name.trim()) {
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        texts.validationError[currentLanguage]
      );
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        experience: parseInt(formData.experience) || 0,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assistants/profile`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // تحديث السياق العام
      updateProfile({
        name: updateData.name,
        specialization: updateData.specialization,
        experience: updateData.experience,
      });
      
      setEditing(false);
      Alert.alert(
        currentLanguage === 'ar' ? 'نجح' : currentLanguage === 'en' ? 'Success' : 'کامیاب',
        texts.saveSuccess[currentLanguage]
      );
      
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : currentLanguage === 'en' ? 'Error' : 'خرابی',
        texts.saveError[currentLanguage]
      );
    } finally {
      setSaving(false);
    }
  }, [formData, getAuthHeaders, updateProfile, texts, currentLanguage]);

  // ✅ تسجيل الخروج
  const handleLogout = useCallback(() => {
    Alert.alert(
      texts.logout[currentLanguage],
      texts.logoutConfirm[currentLanguage],
      [
        {
          text: texts.cancel[currentLanguage],
          style: 'cancel',
        },
        {
          text: texts.logout[currentLanguage],
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  }, [logout, texts, currentLanguage]);

  // ✅ إلغاء التعديل
  const handleCancel = useCallback(() => {
    setEditing(false);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      specialization: userData.specialization || '',
      experience: userData.experience?.toString() || '0',
    });
  }, [userData]);

  // ✅ تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ✅ مكون حقل الإدخال
  const ProfileField = ({ 
    label, 
    value, 
    field, 
    placeholder,
    keyboardType = "default",
    editable = true,
    multiline = false 
  }: {
    label: string;
    value: string;
    field: string;
    placeholder?: string;
    keyboardType?: string;
    editable?: boolean;
    multiline?: boolean;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: currentTheme.text }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && styles.fieldInputMultiline,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
            color: currentTheme.text,
            opacity: editing && editable ? 1 : 0.7,
          }
        ]}
        value={value}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
        placeholder={placeholder}
        placeholderTextColor={currentTheme.textSecondary}
        editable={editing && editable}
        keyboardType={keyboardType as any}
        multiline={multiline}
      />
    </View>
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
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.headerIcon, { color: currentTheme.primary }]}>
            {currentLanguage === 'ar' ? '→' : '←'}
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {texts.title[currentLanguage]}
        </Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (editing) {
              if (saving) return;
              handleSave();
            } else {
              setEditing(true);
            }
          }}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color={currentTheme.primary} />
          ) : (
            <Text style={[styles.headerButtonText, { color: currentTheme.primary }]}>
              {editing ? texts.save[currentLanguage] : texts.edit[currentLanguage]}
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
            {currentLanguage === 'ar' ? 'جاري التحميل...' :
             currentLanguage === 'en' ? 'Loading...' : 'لوڈ ہو رہا ہے...'}
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
              <Text style={[styles.avatarName, { color: currentTheme.text }]}>
                {formData.name || 'المساعد'}
              </Text>
            </View>

            {/* Profile Fields */}
            <View style={styles.fieldsContainer}>
              <ProfileField
                label={texts.name[currentLanguage]}
                value={formData.name}
                field="name"
                placeholder={texts.name[currentLanguage]}
              />
              
              <ProfileField
                label={texts.email[currentLanguage]}
                value={formData.email}
                field="email"
                placeholder={texts.email[currentLanguage]}
                editable={false} // البريد الإلكتروني غير قابل للتعديل
              />
              
              <ProfileField
                label={texts.specialization[currentLanguage]}
                value={formData.specialization}
                field="specialization"
                placeholder={texts.specialization[currentLanguage]}
                multiline={true}
              />
              
              <ProfileField
                label={texts.experience[currentLanguage]}
                value={formData.experience}
                field="experience"
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {editing && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelButtonText, { color: currentTheme.textSecondary }]}>
                    {texts.cancel[currentLanguage]}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.logoutButtonGradient}
                >
                  <Text style={styles.logoutButtonText}>
                    {texts.logout[currentLanguage]}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

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
  headerButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  avatarName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fieldsContainer: {
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  fieldInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    marginBottom: 40,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});