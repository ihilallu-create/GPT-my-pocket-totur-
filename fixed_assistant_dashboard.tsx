import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function AssistantDashboard() {
  const { userData, appSettings, getAuthHeaders } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  // ✅ استخدام useMemo للنصوص لتحسين الأداء
  const texts = useMemo(() => ({
    title: {
      ar: "لوحة المساعد",
      en: "Assistant Dashboard",
      ur: "اسسٹنٹ ڈیش بورڈ"
    },
    welcome: {
      ar: "مرحباً",
      en: "Welcome",
      ur: "خوش آمدید"
    },
    sessions: {
      ar: "الجلسات",
      en: "Sessions",
      ur: "سیشنز"
    },
    students: {
      ar: "الطلاب",
      en: "Students", 
      ur: "طلباء"
    },
    earnings: {
      ar: "الأرباح",
      en: "Earnings",
      ur: "آمدنی"
    },
    rating: {
      ar: "التقييم",
      en: "Rating",
      ur: "ریٹنگ"
    },
    messages: {
      ar: "الرسائل",
      en: "Messages",
      ur: "پیغامات"
    },
    profile: {
      ar: "الملف الشخصي",
      en: "Profile",
      ur: "پروفائل"
    },
    loadError: {
      ar: "خطأ في تحميل البيانات",
      en: "Failed to load data",
      ur: "ڈیٹا لوڈ کرنے میں ناکام"
    }
  }), []);

  // ✅ تحميل البيانات الفعلية من الخادم
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // محاولة تحميل إحصائيات المساعد
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/assistants/profile`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        const data = await response.json();
        // استخدام البيانات المتاحة أو قيم افتراضية
        setStats({
          totalSessions: data.sessions || 0,
          totalStudents: data.students || 0,
          totalEarnings: data.earnings || 0,
          averageRating: data.rating || (data.experience ? data.experience / 2 : 0),
        });
      } else {
        // في حالة الخطأ، استخدم قيم افتراضية
        setStats({
          totalSessions: 0,
          totalStudents: 0,
          totalEarnings: 0,
          averageRating: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // عرض رسالة خطأ للمستخدم
      Alert.alert(
        texts.loadError[currentLanguage],
        currentLanguage === 'ar' ? 'تحقق من اتصال الإنترنت' :
        currentLanguage === 'en' ? 'Check your internet connection' :
        'انٹرنیٹ کنکشن چیک کریں'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeaders, texts, currentLanguage]);

  // ✅ تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ✅ تحديث البيانات عند السحب للتحديث
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
    <View style={[styles.statCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: currentTheme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: currentTheme.textSecondary }]}>{title}</Text>
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
        <View style={styles.headerContent}>
          <Text style={[styles.welcomeText, { color: currentTheme.textSecondary }]}>
            {texts.welcome[currentLanguage]}
          </Text>
          <Text style={[styles.userName, { color: currentTheme.text }]}>
            {userData.name || 'المساعد'}
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentTheme.primary}
            colors={[currentTheme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ عرض مؤشر التحميل */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
            <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
              {currentLanguage === 'ar' ? 'جاري التحميل...' :
               currentLanguage === 'en' ? 'Loading...' : 'لوڈ ہو رہا ہے...'}
            </Text>
          </View>
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <StatCard 
                  title={texts.sessions[currentLanguage]} 
                  value={stats.totalSessions} 
                  icon="📚" 
                />
                <StatCard 
                  title={texts.students[currentLanguage]} 
                  value={stats.totalStudents} 
                  icon="👥" 
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard 
                  title={texts.earnings[currentLanguage]} 
                  value={`${stats.totalEarnings} ر.س`} 
                  icon="💰" 
                />
                <StatCard 
                  title={texts.rating[currentLanguage]} 
                  value={stats.averageRating.toFixed(1)} 
                  icon="⭐" 
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/assistant/messages')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[currentTheme.primary, currentTheme.primary + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>{texts.messages[currentLanguage]}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* ✅ زر مؤقت للملف الشخصي */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    texts.profile[currentLanguage],
                    currentLanguage === 'ar' ? 'قريباً...' :
                    currentLanguage === 'en' ? 'Coming soon...' :
                    'جلد آرہا ہے...'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#475569', '#64748B'] : ['#E2E8F0', '#CBD5E1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionIcon}>👤</Text>
                  <Text style={[styles.actionText, { color: currentTheme.text }]}>
                    {texts.profile[currentLanguage]}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // ✅ إضافة أنماط التحميل
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
  statsContainer: {
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});