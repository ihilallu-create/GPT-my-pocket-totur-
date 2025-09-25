import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const { userData, appSettings, logout } = useUser();
  const currentLanguage = appSettings.currentLanguage;
  const isDarkMode = appSettings.isDarkMode;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Text content for all languages
  const texts = {
    welcome: {
      ar: "مرحباً",
      en: "Welcome", 
      ur: "خوش آمدید"
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
    schedule: {
      ar: "الجدول",
      en: "Schedule",
      ur: "شیڈول"
    },
    profile: {
      ar: "الملف",
      en: "Profile",
      ur: "پروفائل"
    },
    myStudents: {
      ar: "طلابي",
      en: "My Students",
      ur: "میرے طلباء"
    },
    upcomingSessions: {
      ar: "الجلسات القادمة",
      en: "Upcoming Sessions",
      ur: "آنے والے سیشن"
    },
    todaySchedule: {
      ar: "جدول اليوم",
      en: "Today's Schedule",
      ur: "آج کا شیڈول"
    },
    experienceYears: {
      ar: "سنة خبرة",
      en: "Years Experience",
      ur: "سال تجربہ"
    },
    university: {
      ar: "الجامعة",
      en: "University",
      ur: "یونیورسٹی"
    },
    logout: {
      ar: "تسجيل الخروج",
      en: "Logout",
      ur: "لاگ آؤٹ"
    }
  };

  // Mock data - replace with real data later
  const teacherData = {
    name: userData.name || userData.studentName || 'معلم',
    university: userData.universityName || 'جامعة',
    experience: userData.years_experience || 0,
    gpa: userData.gpa || 0,
  };

  const mockStudents = [
    {
      id: '1',
      name: { ar: 'أحمد محمد', en: 'Ahmed Mohamed', ur: 'احمد محمد' },
      subject: { ar: 'الرياضيات', en: 'Mathematics', ur: 'ریاضی' },
      progress: 85,
      lastSession: '2024-01-15'
    },
    {
      id: '2', 
      name: { ar: 'فاطمة علي', en: 'Fatima Ali', ur: 'فاطمہ علی' },
      subject: { ar: 'الفيزياء', en: 'Physics', ur: 'طبیعیات' },
      progress: 72,
      lastSession: '2024-01-14'
    }
  ];

  const mockSessions = [
    {
      id: '1',
      student: { ar: 'أحمد محمد', en: 'Ahmed Mohamed', ur: 'احمد محمد' },
      subject: { ar: 'الرياضيات', en: 'Mathematics', ur: 'ریاضی' },
      time: '10:00 AM',
      duration: '1h',
      type: 'individual'
    },
    {
      id: '2',
      student: { ar: 'سارة أحمد', en: 'Sara Ahmed', ur: 'سارہ احمد' },
      subject: { ar: 'الفيزياء', en: 'Physics', ur: 'طبیعیات' },
      time: '2:00 PM', 
      duration: '1h',
      type: 'group'
    }
  ];

  const tabs = [
    { id: 'students', label: texts.students[currentLanguage], icon: '👨‍🎓' },
    { id: 'sessions', label: texts.sessions[currentLanguage], icon: '📚' },
    { id: 'schedule', label: texts.schedule[currentLanguage], icon: '📅' },
    { id: 'profile', label: texts.profile[currentLanguage], icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {texts.myStudents[currentLanguage]}
            </Text>
            
            <View style={styles.studentsContainer}>
              {mockStudents.map((student) => (
                <LinearGradient
                  key={student.id}
                  colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.studentCard}
                >
                  <View style={styles.studentHeader}>
                    <View style={[styles.studentAvatar, { backgroundColor: currentTheme.primary }]}>
                      <Text style={styles.studentInitial}>
                        {student.name[currentLanguage].charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: currentTheme.text }]}>
                        {student.name[currentLanguage]}
                      </Text>
                      <Text style={[styles.studentSubject, { color: currentTheme.textSecondary }]}>
                        {student.subject[currentLanguage]}
                      </Text>
                    </View>
                    <View style={styles.progressContainer}>
                      <Text style={[styles.progressText, { color: currentTheme.primary }]}>
                        {student.progress}%
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          </View>
        );

      case 'sessions':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {texts.upcomingSessions[currentLanguage]}
            </Text>
            
            <View style={styles.sessionsContainer}>
              {mockSessions.map((session) => (
                <LinearGradient
                  key={session.id}
                  colors={session.type === 'individual' 
                    ? ['#6366F1', '#8B5CF6'] 
                    : ['#10B981', '#06B6D4']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sessionCard}
                >
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionIcon}>
                      {session.type === 'individual' ? '👤' : '👥'}
                    </Text>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionStudent}>
                        {session.student[currentLanguage]}
                      </Text>
                      <Text style={styles.sessionSubject}>
                        {session.subject[currentLanguage]}
                      </Text>
                    </View>
                    <View style={styles.sessionTime}>
                      <Text style={styles.sessionTimeText}>{session.time}</Text>
                      <Text style={styles.sessionDuration}>{session.duration}</Text>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          </View>
        );

      case 'schedule':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {texts.todaySchedule[currentLanguage]}
            </Text>
            
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.scheduleCard}
            >
              <Text style={[styles.scheduleText, { color: currentTheme.textSecondary }]}>
                {currentLanguage === 'ar' ? 'قريباً - ميزة الجدول' : 
                 currentLanguage === 'en' ? 'Coming Soon - Schedule Feature' : 
                 'جلد آرہا ہے - شیڈول فیچر'}
              </Text>
            </LinearGradient>
          </View>
        );

      case 'profile':
        return (
          <View style={styles.tabContent}>
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#334155'] : ['#FFFFFF', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.profileCard}
            >
              <View style={styles.profileHeader}>
                <View style={[styles.profileAvatar, { backgroundColor: currentTheme.primary }]}>
                  <Text style={styles.profileInitial}>
                    {teacherData.name.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.profileName, { color: currentTheme.text }]}>
                  {teacherData.name}
                </Text>
              </View>

              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: currentTheme.primary }]}>
                    {teacherData.experience}
                  </Text>
                  <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
                    {texts.experienceYears[currentLanguage]}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: currentTheme.primary }]}>
                    {teacherData.gpa.toFixed(1)}
                  </Text>
                  <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
                    GPA
                  </Text>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.profileUniversity, { color: currentTheme.text }]}>
                  🏛️ {teacherData.university}
                </Text>
                <Text style={[styles.profileEmail, { color: currentTheme.textSecondary }]}>
                  📧 {userData.email}
                </Text>
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

      default:
        return null;
    }
  };

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
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: currentTheme.textSecondary }]}>
            {texts.welcome[currentLanguage]}
          </Text>
          <Text style={[styles.teacherName, { color: currentTheme.text }]}>
            {teacherData.name}
          </Text>
        </View>
        
        <View style={[styles.profileImage, { backgroundColor: currentTheme.primary }]}>
          <Text style={styles.profileInitial}>
            {teacherData.name.charAt(0)}
          </Text>
        </View>
      </LinearGradient>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={[styles.bottomTabs, { backgroundColor: currentTheme.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: currentTheme.primary + '20' }
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabIcon,
              { color: activeTab === tab.id ? currentTheme.primary : currentTheme.textSecondary }
            ]}>
              {tab.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  profileImage: {
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
  tabContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  studentsContainer: {
    gap: 12,
  },
  studentCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentSubject: {
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionsContainer: {
    gap: 12,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionStudent: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  sessionSubject: {
    color: '#FFFFFF99',
    fontSize: 14,
  },
  sessionTime: {
    alignItems: 'flex-end',
  },
  sessionTimeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionDuration: {
    color: '#FFFFFF99',
    fontSize: 12,
  },
  scheduleCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleText: {
    fontSize: 16,
    fontStyle: 'italic',
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
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  profileInfo: {
    marginBottom: 24,
    gap: 8,
  },
  profileUniversity: {
    fontSize: 16,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    textAlign: 'center',
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
  },
});