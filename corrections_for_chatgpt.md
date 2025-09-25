# تعليمات محسّنة لـ ChatGPT - My Pocket Tutor

## ✅ الكود الموحد الذي أرسلته مناسب 95%! 

### 🔧 **التعديل الوحيد المطلوب:**

في قسم Backend، استبدل هذا السطر:
```python
db = client[os.environ['DB_NAME']]
```

بهذا:
```python
db = client[os.environ.get('DB_NAME', 'test_database')]
```

### ✅ **باقي الكود مثالي ولا يحتاج تغيير!**

---

## 🎯 **قواعد الكتابة المُحسّنة لـ ChatGPT:**

### **1. بنية الخادم (Backend):**
```python
# ✅ استخدم هذا النمط دائماً:
@api_router.post("/assistants/signup")
async def assistant_signup(data: AssistantSignup):
    # التحقق من وجود المستخدم
    existing = await db.assistants.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Already exists")
    
    # إنشاء كائن جديد
    assistant = Assistant(name=data.name, email=data.email)
    doc = assistant.dict()
    doc["password"] = get_password_hash(data.password)
    
    # حفظ في قاعدة البيانات
    await db.assistants.insert_one(doc)
    
    # إنشاء token
    token = create_access_token(data={"sub": assistant.email})
    
    return {
        "id": assistant.id,
        "name": assistant.name,
        "email": assistant.email,
        "accessToken": token,
        "tokenType": "bearer"
    }
```

### **2. بنية UserContext:**
```typescript
// ✅ استخدم هذا النمط دائماً:
interface UserData {
  // حقول الطالب الأساسية
  studentName: string;
  phoneNumber: string;
  email: string;
  universityName: string;
  universityId: string;
  joinDate: string;
  isLoggedIn: boolean;
  userType: 'student' | 'teacher' | 'assistant';
  
  // حقول إضافية للمعلم/المساعد
  name?: string;
  id?: string;
  specialization?: string;
  experience?: number;
}

// ✅ دائماً اضف AuthData منفصل:
interface AuthData {
  accessToken: string;
  tokenType: string;
}

// ✅ دائماً اضف getAuthHeaders:
const getAuthHeaders = () =>
  authData?.accessToken
    ? { 
        'Content-Type': 'application/json', 
        'Authorization': `${authData.tokenType} ${authData.accessToken}` 
      }
    : { 'Content-Type': 'application/json' };
```

### **3. بنية صفحات React Native:**
```typescript
// ✅ استخدم هذا النمط دائماً:
import React, { useMemo, useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TextInput, 
  TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useUser } from "../../contexts/UserContext";

// ✅ دائماً استخدم themes منفصلة:
const lightTheme = { 
  background: "#F8FAFC", surface: "#FFFFFF", 
  primary: "#4F46E5", text: "#1F2937", 
  textSecondary: "#6B7280", border: "#E5E7EB" 
};
const darkTheme = { 
  background: "#0F172A", surface: "#1E293B", 
  primary: "#6366F1", text: "#F1F5F9", 
  textSecondary: "#94A3B8", border: "#334155" 
};

export default function MyComponent() {
  const { login, appSettings } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const theme = isDarkMode ? darkTheme : lightTheme;

  // ✅ دائماً استخدم useMemo للنصوص:
  const t = useMemo(() => ({
    title: { ar: "العنوان", en: "Title", ur: "ٹائٹل" },
    // ... باقي النصوص
  }), []);

  // ✅ دائماً استخدم هذا النمط للاستدعاءات:
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/endpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        Alert.alert("خطأ", error.detail || "فشل العملية");
      } else {
        const result = await response.json();
        await login({
          isLoggedIn: true,
          userType: "assistant",
          name: result?.name,
          email: result?.email,
          id: result?.id
        }, {
          accessToken: result?.accessToken,
          tokenType: "bearer"
        });
        router.replace("/assistant/dashboard");
      }
    } catch {
      Alert.alert("خطأ", "تحقق من الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {/* باقي المحتوى */}
    </SafeAreaView>
  );
}
```

### **4. قواعد التصميم:**
```typescript
// ✅ دائماً استخدم StyleSheet.create:
const styles = StyleSheet.create({
  container: { flex: 1 },
  // استخدم أرقام قابلة للقسمة على 4: 4, 8, 12, 16, 20, 24
  padding: { padding: 16 }, 
  margin: { margin: 12 },
  // استخدم border radius: 8, 12, 16, 20
  borderRadius: { borderRadius: 12 },
});
```

---

## 🚫 **أخطاء شائعة يجب تجنبها:**

### **❌ لا تفعل هذا:**
```typescript
// ❌ استيراد React بدون useState
import React from "react";

// ❌ استخدام login بمعامل واحد
await login({ userType: "assistant" });

// ❌ عدم استخدام getAuthHeaders
headers: { "Authorization": `Bearer ${token}` }

// ❌ عدم معالجة الأخطاء
const response = await fetch(url);
const data = await response.json();
```

### **✅ افعل هذا:**
```typescript
// ✅ استيراد React مع hooks
import React, { useState, useMemo } from "react";

// ✅ استخدام login بمعاملين
await login({ userType: "assistant" }, { accessToken, tokenType });

// ✅ استخدام getAuthHeaders
headers: getAuthHeaders()

// ✅ معالجة الأخطاء دائماً
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error();
  const data = await response.json();
} catch {
  Alert.alert("خطأ", "فشل العملية");
}
```

---

## 📋 **قائمة فحص نهائية:**

قبل إرسال أي كود، تأكد من:
- [ ] ✅ استيراد React مع جميع hooks المطلوبة  
- [ ] ✅ استخدام `useUser()` من `../../contexts/UserContext`
- [ ] ✅ استخدام `process.env.EXPO_PUBLIC_BACKEND_URL` 
- [ ] ✅ استخدام `getAuthHeaders()` للمصادقة
- [ ] ✅ معالجة جميع الأخطاء مع `try/catch`
- [ ] ✅ استخدام `Alert.alert()` للرسائل
- [ ] ✅ استخدام `router.replace()` للتنقل
- [ ] ✅ دعم الثلاث لغات: `ar`, `en`, `ur`
- [ ] ✅ دعم النمط الليلي/الفاتح
- [ ] ✅ استخدام `StyleSheet.create()`
- [ ] ✅ استخدام `KeyboardAvoidingView` في النماذج

---

## 🎯 **خلاصة:**
الكود الموحد الذي أرسلته **ممتاز ومناسب 95%**! فقط قم بالتعديل المذكور أعلاه في الخادم، وباقي الكود جاهز للتطبيق مباشرة.

**ChatGPT اتبع هذه القواعد بالضبط وستحصل على كود متوافق 100% مع التطبيق!**