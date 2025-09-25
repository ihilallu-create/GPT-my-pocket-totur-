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

export default function TestBooking() {
  const { userData, appSettings } = useUser();
  const isDarkMode = appSettings.isDarkMode;
  const currentLanguage = appSettings.currentLanguage;

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const texts = {
    title: {
      ar: "صفحة الحجز الجديدة - تجريبية",
      en: "New Booking Page - Test",
      ur: "نیا بکنگ صفحہ - ٹیسٹ"
    },
    description: {
      ar: "هذه صفحة تجريبية للحجز الشامل",
      en: "This is a test page for comprehensive booking",
      ur: "یہ جامع بکنگ کے لیے ایک ٹیسٹ صفحہ ہے"
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

      <ScrollView style={styles.content}>
        <View style={styles.testContainer}>
          <Text style={[styles.testTitle, { color: currentTheme.text }]}>
            {texts.title[currentLanguage]}
          </Text>
          
          <Text style={[styles.testDescription, { color: currentTheme.textSecondary }]}>
            {texts.description[currentLanguage]}
          </Text>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: currentTheme.primary }]}
            onPress={() => alert('اختبار نجح!')}
          >
            <Text style={styles.testButtonText}>
              اختبار الصفحة
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  testContainer: {
    padding: 20,
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  testDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  testButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});