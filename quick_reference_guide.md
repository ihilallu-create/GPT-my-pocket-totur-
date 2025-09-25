# 🚀 دليل المرجع السريع - My Pocket Tutor

## 📋 **نموذج كود جاهز للنسخ واللصق**

### **1. قالب Component أساسي:**

```javascript
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

export default function MyComponent() {
  const { userData, appSettings, getAuthHeaders } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const texts = useMemo(() => ({
    title: { ar: "العنوان", en: "Title", ur: "ٹائٹل" },
    loading: { ar: "جاري التحميل...", en: "Loading...", ur: "لوڈ ہو رہا ہے..." },
    error: { ar: "خطأ", en: "Error", ur: "خرابی" },
    retry: { ar: "إعادة المحاولة", en: "Retry", ur: "دوبارہ کوشش" }
  }), []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/endpoint`,
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      setData(result);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(texts.error[currentLanguage], error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeaders, texts, currentLanguage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>
            {texts.loading[currentLanguage]}
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* المحتوى */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const lightTheme = {
  background: '#F8FAFC', surface: '#FFFFFF', primary: '#F59E0B',
  text: '#1F2937', textSecondary: '#6B7280', border: '#E5E7EB',
};
const darkTheme = {
  background: '#0F172A', surface: '#1E293B', primary: '#F59E0B',
  text: '#F1F5F9', textSecondary: '#94A3B8', border: '#334155',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
});
```

---

### **2. قالب Backend Endpoint:**

```python
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime

# النموذج
class MyModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

# إنشاء جديد
@api_router.post("/my-endpoint")
async def create_item(item_data: MyModel):
    try:
        # التحقق من الوجود
        existing = await db.collection.find_one({"email": item_data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item already exists"
            )
        
        # إنشاء العنصر
        item_dict = item_data.dict()
        await db.collection.insert_one(item_dict)
        
        return {
            "id": item_data.id,
            "message": "Created successfully",
            "data": item_dict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# استرجاع بيانات
@api_router.get("/my-endpoint/{item_id}")
async def get_item(item_id: str, current_user = Depends(get_current_user)):
    try:
        item = await db.collection.find_one({"id": item_id})
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        # إزالة البيانات الحساسة
        item.pop('password', None)
        item.pop('_id', None)
        
        return item
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
```

---

### **3. Hook مخصص للـ API:**

```javascript
// hooks/useApiCall.js
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export const useApiCall = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useUser();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`,
        {
          headers: getAuthHeaders(),
          ...options
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);

    } catch (err) {
      setError(err);
      console.error(`API Error [${endpoint}]:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// الاستخدام
const MyComponent = () => {
  const { data, loading, error, refetch } = useApiCall('/api/my-data');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  
  return <DataDisplay data={data} />;
};
```

---

### **4. مكون Form متقدم:**

```javascript
// components/Form.js
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const FormField = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  theme 
}) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: theme.text }]}>
      {label}
    </Text>
    <TextInput
      style={[
        styles.fieldInput,
        error && styles.fieldInputError,
        { 
          backgroundColor: theme.surface, 
          borderColor: error ? '#EF4444' : theme.border,
          color: theme.text 
        }
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textSecondary}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export const SubmitButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  theme 
}) => (
  <TouchableOpacity
    style={[styles.button, { opacity: disabled ? 0.7 : 1 }]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={[theme.primary, theme.primary + 'CC']}
      style={styles.buttonGradient}
    >
      <Text style={styles.buttonText}>
        {loading ? '...' : title}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  fieldInput: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 16
  },
  fieldInputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  button: { borderRadius: 12, overflow: 'hidden', marginTop: 16 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
```

---

### **5. نمط معالجة الأخطاء:**

```javascript
// utils/errorHandler.js
export const handleApiError = (error, context, texts, currentLanguage) => {
  let message = texts.genericError[currentLanguage];
  
  // تصنيف الأخطاء
  if (error.status === 401) {
    message = texts.authError[currentLanguage];
    // إعادة توجيه لتسجيل الدخول
    router.replace('/login');
  } else if (error.status === 403) {
    message = texts.permissionError[currentLanguage];
  } else if (error.status === 404) {
    message = texts.notFoundError[currentLanguage];
  } else if (error.status >= 500) {
    message = texts.serverError[currentLanguage];
  } else if (!navigator.onLine) {
    message = texts.networkError[currentLanguage];
  }
  
  Alert.alert(texts.error[currentLanguage], message);
  
  // تسجيل للمطورين
  console.error(`[${context}] Error:`, {
    status: error.status,
    message: error.message,
    timestamp: new Date().toISOString()
  });
};

// Hook للاستخدام
export const useErrorHandler = () => {
  const { appSettings } = useUser();
  const { currentLanguage } = appSettings;
  
  const texts = useMemo(() => ({
    error: { ar: "خطأ", en: "Error", ur: "خرابی" },
    genericError: { ar: "حدث خطأ غير متوقع", en: "An unexpected error occurred", ur: "غیر متوقع خرابی" },
    authError: { ar: "انتهت صلاحية الجلسة", en: "Session expired", ur: "سیشن ختم ہو گیا" },
    networkError: { ar: "تحقق من الاتصال", en: "Check your connection", ur: "کنکشن چیک کریں" }
  }), []);
  
  return useCallback((error, context) => {
    handleApiError(error, context, texts, currentLanguage);
  }, [texts, currentLanguage]);
};
```

---

### **6. خدمة التحليلات:**

```javascript
// services/analytics.js
class AnalyticsService {
  static trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        platform: Platform.OS,
        app_version: Constants.expoConfig?.version
      }
    };
    
    console.log('Analytics Event:', event);
    
    // إرسال للخادم في الإنتاج
    if (!__DEV__) {
      this.sendToServer(event);
    }
  }
  
  static trackScreenView(screenName) {
    this.trackEvent('screen_view', { screen_name: screenName });
  }
  
  static trackUserAction(action, target) {
    this.trackEvent('user_action', { action, target });
  }
  
  static async sendToServer(data) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
}

// Hook للاستخدام
export const useAnalytics = (screenName) => {
  useEffect(() => {
    AnalyticsService.trackScreenView(screenName);
  }, [screenName]);
  
  const trackAction = useCallback((action, target) => {
    AnalyticsService.trackUserAction(action, target);
  }, []);
  
  return { trackAction };
};
```

---

## 🎯 **قواعد سريعة للتذكر:**

### **✅ افعل دائماً:**
- `useMemo(() => ({ texts }), [])`
- `useCallback(async () => { ... }, [dependencies])`
- `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/endpoint`
- `headers: getAuthHeaders()`
- `try { ... } catch { Alert.alert(...) }`
- `{loading ? <ActivityIndicator /> : <Content />}`

### **❌ لا تفعل أبداً:**
- بيانات ثابتة بدون API calls
- URLs مشفرة في الكود
- `onRefresh` وهمي مع setTimeout
- نصوص بدون `useMemo`
- عدم معالجة الأخطاء

### **🔧 المتغيرات المهمة:**
- `process.env.EXPO_PUBLIC_BACKEND_URL` - رابط الخادم
- `isDarkMode ? darkTheme : lightTheme` - النمط
- `texts[key][currentLanguage]` - الترجمة
- `getAuthHeaders()` - headers المصادقة

هذا المرجع يحتوي على كل ما تحتاجه لبناء مكونات متسقة وعالية الجودة في التطبيق! 🚀