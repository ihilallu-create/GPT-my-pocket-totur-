import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useUser } from "../../contexts/UserContext";

// ===== الواجهات والأنواع =====
interface TeacherStats {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  uniqueStudents: number;
  averageRating: number;
  totalEarnings: number;
  totalRatings: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  universityName: string;
  lastSession: string;
  totalSessions: number;
  averageRating?: number;
}

interface Session {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  duration: number;
}

interface Rating {
  id: string;
  studentName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  sessionSubject?: string;
}

export default function EnhancedTeacherDashboard() {
  // ===== الحالات الأساسية =====
  const { userData, appSettings, getAuthHeaders, logout } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // ===== بيانات Dashboard =====
  const [stats, setStats] = useState<TeacherStats>({
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    uniqueStudents: 0,
    averageRating: 0,
    totalEarnings: 0,
    totalRatings: 0,
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [notifications, setNotifications] = useState([]);

  // ===== النصوص متعددة اللغات =====
  const texts = {
    welcome: {
      ar: "مرحباً",
      en: "Welcome",
      ur: "خوش آمدید"
    },
    dashboard: {
      ar: "لوحة التحكم",
      en: "Dashboard",
      ur: "ڈیش بورڈ"
    },
    overview: {
      ar: "نظرة عامة",
      en: "Overview",
      ur: "مجموعی جائزہ"
    },
    students: {
      ar: "الطلاب",
      en: "Students",
      ur: "طلباء"
    },
    sessions: {
      ar: "الجلسات",
      en: "Sessions",
      ur: "سیشن"
    },
    ratings: {
      ar: "التقييمات",
      en: "Ratings",
      ur: "درجہ بندی"
    },
    profile: {
      ar: "الملف الشخصي",
      en: "Profile",
      ur: "پروفائل"
    },
    totalSessions: {
      ar: "إجمالي الجلسات",
      en: "Total Sessions",
      ur: "کل سیشن"
    },
    completedSessions: {
      ar: "الجلسات المكتملة",
      en: "Completed Sessions",
      ur: "مکمل سیشن"
    },
    pendingSessions: {
      ar: "الجلسات المعلقة",
      en: "Pending Sessions",
      ur: "زیر التواء سیشن"
    },
    totalStudents: {
      ar: "إجمالي الطلاب",
      en: "Total Students",
      ur: "کل طلباء"
    },
    averageRating: {
      ar: "متوسط التقييم",
      en: "Average Rating",
      ur: "اوسط درجہ"
    },
    totalEarnings: {
      ar: "إجمالي الأرباح",
      en: "Total Earnings",
      ur: "کل کمائی"
    },
    upcomingSessions: {
      ar: "الجلسات القادمة",
      en: "Upcoming Sessions",
      ur: "آنے والے سیشن"
    },
    recentRatings: {
      ar: "التقييمات الأخيرة",
      en: "Recent Ratings",
      ur: "حالیہ درجہ بندی"
    },
    myStudents: {
      ar: "طلابي",
      en: "My Students",
      ur: "میرے طلباء"
    },
    noData: {
      ar: "لا توجد بيانات",
      en: "No data available",
      ur: "کوئی ڈیٹا دستیاب نہیں"
    },
    loading: {
      ar: "جاري التحميل...",
      en: "Loading...",
      ur: "لوڈ ہو رہا ہے..."
    },
    logout: {
      ar: "تسجيل الخروج",
      en: "Logout",
      ur: "لاگ آؤٹ"
    },
    confirmLogout: {
      ar: "هل تريد تسجيل الخروج؟",
      en: "Do you want to logout?",
      ur: "کیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟"
    },
    cancel: {
      ar: "إلغاء",
      en: "Cancel",
      ur: "منسوخ"
    },
    confirm: {
      ar: "تأكيد",
      en: "Confirm",
      ur: "تصدیق"
    }
  };

  // ===== دوال تحميل البيانات =====
  const loadDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      
      // تحميل الإحصائيات
      const statsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/teachers/dashboard-stats`,
        { headers }
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // تحميل الجلسات القادمة
      const sessionsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/sessions/my-sessions`,
        { headers }
      );
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        const upcoming = sessionsData
          .filter((session: Session) => session.status === 'confirmed' || session.status === 'pending')
          .slice(0, 5);
        setUpcomingSessions(upcoming);
      }
      
      // تحميل التقييمات الأخيرة
      if (userData.id) {
        const ratingsResponse = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/teachers/${userData.id}/ratings`,
          { headers }
        );
        
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setRecentRatings(ratingsData.slice(0, 5));
        }
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  // ===== تأثيرات جانبية =====
  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  // ===== دوال المساعدة =====
  const handleLogout = () => {
    Alert.alert(
      texts.confirmLogout[currentLanguage],
      "",
      [
        {
          text: texts.cancel[currentLanguage],
          style: "cancel"
        },
        {
          text: texts.confirm[currentLanguage],
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      currentLanguage === 'ar' ? 'ar-SA' : 'en-US',
      { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  };

  // ===== عرض الإحصائيات =====
  const renderStatsCards = () => {
    const statsCards = [
      {
        title: texts.totalSessions[currentLanguage],
        value: stats.totalSessions.toString(),
        icon: "📚",
        color: "#6366F1"
      },
      {
        title: texts.completedSessions[currentLanguage],
        value: stats.completedSessions.toString(),
        icon: "✅",
        color: "#10B981"
      },
      {
        title: texts.totalStudents[currentLanguage],
        value: stats.uniqueStudents.toString(),
        icon: "👨‍🎓",
        color: "#F59E0B"
      },
      {
        title: texts.averageRating[currentLanguage],
        value: stats.averageRating.toFixed(1),
        icon: "⭐",
        color: "#EF4444"
      }
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        {statsCards.map((card, index) => (
          <LinearGradient
            key={index}
            colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.statsCard}
          >
            <View style={[styles.statsIconContainer, { backgroundColor: card.color + '20' }]}>
              <Text style={styles.statsIcon}>{card.icon}</Text>
            </View>
            
            <View style={styles.statsInfo}>
              <Text style={[styles.statsValue, { color: currentTheme.text }]}>
                {card.value}
              </Text>
              <Text style={[styles.statsTitle, { color: currentTheme.textSecondary }]}>
                {card.title}
              </Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
    );
  };

  // ===== عرض الجلسات القادمة =====
  const renderUpcomingSessions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
        {texts.upcomingSessions[currentLanguage]}
      </Text>
      
      {upcomingSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: currentTheme.textSecondary }]}>
            {texts.noData[currentLanguage]}
          </Text>
        </View>
      ) : (
        <FlatList
          data={upcomingSessions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.sessionCard}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionStudent, { color: currentTheme.text }]}>
                    {item.studentName}
                  </Text>
                  <Text style={[styles.sessionSubject, { color: currentTheme.textSecondary }]}>
                    {item.subject}
                  </Text>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'confirmed' ? '#10B981' : '#F59E0B' }
                ]}>
                  <Text style={styles.statusText}>
                    {item.status === 'confirmed' 
                      ? (currentLanguage === 'ar' ? 'مؤكد' : currentLanguage === 'en' ? 'Confirmed' : 'تصدیق شدہ')
                      : (currentLanguage === 'ar' ? 'معلق' : currentLanguage === 'en' ? 'Pending' : 'زیر التواء')
                    }
                  </Text>
                </View>
              </View>
              
              <View style={styles.sessionDetails}>
                <View style={styles.sessionDetailItem}>
                  <Text style={styles.sessionDetailIcon}>📅</Text>
                  <Text style={[styles.sessionDetailText, { color: currentTheme.textSecondary }]}>
                    {formatDate(item.date)}
                  </Text>
                </View>
                
                <View style={styles.sessionDetailItem}>
                  <Text style={styles.sessionDetailIcon}>⏰</Text>
                  <Text style={[styles.sessionDetailText, { color: currentTheme.textSecondary }]}>
                    {item.time}
                  </Text>
                </View>
                
                <View style={styles.sessionDetailItem}>
                  <Text style={styles.sessionDetailIcon}>💰</Text>
                  <Text style={[styles.sessionDetailText, { color: currentTheme.text, fontWeight: 'bold' }]}>
                    {formatCurrency(item.price)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}
        />
      )}
    </View>
  );

  // ===== عرض التقييمات الأخيرة =====
  const renderRecentRatings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
        {texts.recentRatings[currentLanguage]}
      </Text>
      
      {recentRatings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: currentTheme.textSecondary }]}>
            {texts.noData[currentLanguage]}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentRatings}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.ratingCard}
            >
              <View style={styles.ratingHeader}>
                <View style={styles.ratingStudentInfo}>
                  <Text style={[styles.ratingStudentName, { color: currentTheme.text }]}>
                    {item.studentName}
                  </Text>
                  <Text style={[styles.ratingDate, { color: currentTheme.textSecondary }]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={[
                      styles.star,
                      { color: star <= item.rating ? '#F59E0B' : '#E5E7EB' }
                    ]}>
                      ⭐
                    </Text>
                  ))}
                </View>
              </View>
              
              {item.comment && (
                <Text style={[styles.ratingComment, { color: currentTheme.textSecondary }]}>
                  "{item.comment}"
                </Text>
              )}
            </LinearGradient>
          )}
        />
      )}
    </View>
  );

  // ===== عرض الملف الشخصي =====
  const renderProfile = () => (
    <View style={styles.section}>
      <LinearGradient
        colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.profileCard}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.profileAvatar, { backgroundColor: currentTheme.primary }]}>
            <Text style={styles.profileInitial}>
              {(userData.name || userData.studentName || 'معلم').charAt(0)}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: currentTheme.text }]}>
              {userData.name || userData.studentName || 'معلم'}
            </Text>
            <Text style={[styles.profileEmail, { color: currentTheme.textSecondary }]}>
              {userData.email}
            </Text>
            <Text style={[styles.profileUniversity, { color: currentTheme.textSecondary }]}>
              {userData.university || userData.universityName || 'الجامعة'}
            </Text>
          </View>
        </View>

        <View style={styles.profileStats}>
          <View style={styles.profileStatItem}>
            <Text style={[styles.profileStatValue, { color: currentTheme.primary }]}>
              {stats.totalRatings}
            </Text>
            <Text style={[styles.profileStatLabel, { color: currentTheme.textSecondary }]}>
              {currentLanguage === 'ar' ? 'التقييمات' : currentLanguage === 'en' ? 'Ratings' : 'درجہ بندی'}
            </Text>
          </View>
          
          <View style={styles.profileStatItem}>
            <Text style={[styles.profileStatValue, { color: currentTheme.primary }]}>
              {stats.averageRating.toFixed(1)}
            </Text>
            <Text style={[styles.profileStatLabel, { color: currentTheme.textSecondary }]}>
              {currentLanguage === 'ar' ? 'المتوسط' : currentLanguage === 'en' ? 'Average' : 'اوسط'}
            </Text>
          </View>
          
          <View style={styles.profileStatItem}>
            <Text style={[styles.profileStatValue, { color: currentTheme.primary }]}>
              {formatCurrency(stats.totalEarnings)}
            </Text>
            <Text style={[styles.profileStatLabel, { color: currentTheme.textSecondary }]}>
              {currentLanguage === 'ar' ? 'الأرباح' : currentLanguage === 'en' ? 'Earnings' : 'کمائی'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#EF4444' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>
            {texts.logout[currentLanguage]}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  // ===== عرض المحتوى حسب التبويب =====
  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
            {texts.loading[currentLanguage]}
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {renderStatsCards()}
            {renderUpcomingSessions()}
            {renderRecentRatings()}
          </View>
        );
      
      case 'sessions':
        return renderUpcomingSessions();
      
      case 'ratings':
        return renderRecentRatings();
      
      case 'profile':
        return renderProfile();
      
      default:
        return renderStatsCards();
    }
  };

  // ===== التبويبات =====
  const tabs = [
    { id: 'overview', label: texts.overview[currentLanguage], icon: '📊' },
    { id: 'sessions', label: texts.sessions[currentLanguage], icon: '📚' },
    { id: 'ratings', label: texts.ratings[currentLanguage], icon: '⭐' },
    { id: 'profile', label: texts.profile[currentLanguage], icon: '👤' },
  ];

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
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: currentTheme.textSecondary }]}>
              {texts.welcome[currentLanguage]}
            </Text>
            <Text style={[styles.teacherName, { color: currentTheme.text }]}>
              {userData.name || userData.studentName || 'معلم'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.profileImageButton, { backgroundColor: currentTheme.primary }]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={styles.profileInitial}>
              {(userData.name || userData.studentName || 'معلم').charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[currentTheme.primary]}
            tintColor={currentTheme.primary}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomTabs, { backgroundColor: currentTheme.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: currentTheme.primary + '20' }
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabIcon,
              { color: activeTab === tab.id ? currentTheme.primary : currentTheme.textSecondary }
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? currentTheme.primary : currentTheme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ===== الألوان =====
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

// ===== الأنماط =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileImageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  statsContainer: {
    marginVertical: 20,
  },
  statsCard: {
    width: 160,
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    fontSize: 24,
  },
  statsInfo: {
    alignItems: 'flex-start',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    textAlign: 'left',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionStudent: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionSubject: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  sessionDetailText: {
    fontSize: 14,
  },
  ratingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStudentInfo: {
    flex: 1,
  },
  ratingStudentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ratingDate: {
    fontSize: 12,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginLeft: 2,
  },
  ratingComment: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileUniversity: {
    fontSize: 14,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});