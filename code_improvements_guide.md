# 🔧 تحسينات على الكود المُقدم

## 📋 **مراجعة شاملة - الدرجة: 92/100**

### ✅ **ممتاز - يتبع المعايير:**
- معمارية منظمة وواضحة
- استخدام متغيرات البيئة بشكل صحيح
- فصل الإحصاءات عن الملف الشخصي
- استخدام `useCallback` و `useMemo` بذكاء
- Loading states شاملة
- معالجة أخطاء جيدة

### ⚠️ **تحسينات مطلوبة (8 نقاط):**

## 1. مشكلة في `/app/frontend/app/login.tsx`

### ❌ **المشكلة:**
```javascript
// لا يستخدم useMemo للنصوص
const submit = async () => {
  // ...
};
```

### ✅ **الحل:**
```javascript
import React, { useState, useMemo } from "react";

export default function Login() {
  const { login, appSettings } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ إضافة النصوص مع useMemo
  const texts = useMemo(() => ({
    title: { ar: "تسجيل دخول المساعد", en: "Assistant Login", ur: "اسسٹنٹ لاگ اِن" },
    email: { ar: "البريد الإلكتروني", en: "Email", ur: "ای میل" },
    password: { ar: "كلمة المرور", en: "Password", ur: "پاس ورڈ" },
    login: { ar: "تسجيل الدخول", en: "Login", ur: "لاگ اِن" },
    error: { ar: "خطأ", en: "Error", ur: "خرابی" },
  }), []);

  const submit = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ id:string; name:string; email:string; accessToken:string; tokenType:string; }>(
        "/assistants/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      await login(
        { email: res.email, name: res.name, id: res.id, userType: "assistant", isLoggedIn: true },
        { accessToken: res.accessToken, tokenType: res.tokenType }
      );
      router.replace("/assistant/dashboard");
    } catch (e:any) {
      Alert.alert(texts.error[currentLanguage], e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {texts.title[currentLanguage]}
        </Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
          placeholder={texts.email[currentLanguage]} 
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none" 
          keyboardType="email-address" 
          value={email} 
          onChangeText={setEmail}
        />
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
          placeholder={texts.password[currentLanguage]} 
          placeholderTextColor={theme.textSecondary}
          secureTextEntry 
          value={password} 
          onChangeText={setPass}
        />
        <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
          <LinearGradient colors={[theme.primary, theme.primary + 'CC']} style={styles.buttonGradient}>
            {loading ? <ActivityIndicator color="#FFF" /> : 
              <Text style={styles.buttonText}>{texts.login[currentLanguage]}</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ✅ إضافة الثيمات
const lightTheme = { 
  background: "#F8FAFC", surface: "#FFFFFF", primary: "#F59E0B", 
  text: "#1F2937", textSecondary: "#6B7280", border: "#E5E7EB" 
};
const darkTheme = { 
  background: "#0F172A", surface: "#1E293B", primary: "#F59E0B", 
  text: "#F1F5F9", textSecondary: "#94A3B8", border: "#334155" 
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { 
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 16,
    backgroundColor: "#FFFFFF"
  },
  button: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
  buttonGradient: { paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
```

## 2. تحسين معالجة الأخطاء في `apiFetch`

### ❌ **المشكلة الحالية:**
```javascript
// معالجة أخطاء أساسية
export async function apiFetch<T = any>(path: string, opts: RequestInit & { headers?: Record<string, string> } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const msg = await safeJson(res);
    throw new Error(msg?.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

### ✅ **الحل المحسن:**
```javascript
// lib/api.ts - نسخة محسنة
export const API_BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

// ✅ كلاس خطأ مخصص
export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { headers?: Record<string, string>; timeout?: number } = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOpts } = opts;
  
  // ✅ إضافة timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...fetchOpts,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(fetchOpts.headers || {}) },
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorData = await safeJson(res);
      
      // ✅ معالجة أخطاء متخصصة
      let message = errorData?.detail || errorData?.message || `HTTP ${res.status}`;
      
      if (res.status === 401) {
        message = "Authentication required";
      } else if (res.status === 403) {
        message = "Access denied";
      } else if (res.status === 404) {
        message = "Resource not found";
      } else if (res.status >= 500) {
        message = "Server error occurred";
      }
      
      throw new ApiError(res.status, message, errorData);
    }
    
    return res.json() as Promise<T>;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    // خطأ شبكة عام
    throw new ApiError(0, 'Network error occurred');
  }
}

// ✅ Helper للاستخدام مع معالجة الأخطاء
export const handleApiError = (error: any, texts: any, currentLanguage: string) => {
  let message = texts.genericError?.[currentLanguage] || 'An error occurred';
  
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        message = texts.authError?.[currentLanguage] || 'Authentication required';
        // يمكن إضافة logout هنا
        break;
      case 403:
        message = texts.permissionError?.[currentLanguage] || 'Access denied';
        break;
      case 404:
        message = texts.notFoundError?.[currentLanguage] || 'Not found';
        break;
      case 408:
        message = texts.timeoutError?.[currentLanguage] || 'Request timeout';
        break;
      case 0:
        message = texts.networkError?.[currentLanguage] || 'Network error';
        break;
      default:
        message = error.message;
    }
  }
  
  return message;
};
```

## 3. إضافة صفحة signup للمساعد

### ✅ **إضافة مطلوبة:**
```javascript
// /app/frontend/app/signup.tsx
import React, { useState, useMemo, useCallback } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { apiFetch } from "../lib/api";
import { useUser } from "../contexts/UserContext";

export default function Signup() {
  const { login, appSettings } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: 0
  });
  const [loading, setLoading] = useState(false);

  const texts = useMemo(() => ({
    title: { ar: "إنشاء حساب مساعد", en: "Create Assistant Account", ur: "اسسٹنٹ اکاؤنٹ بنائیں" },
    name: { ar: "الاسم", en: "Name", ur: "نام" },
    email: { ar: "البريد الإلكتروني", en: "Email", ur: "ای میل" },
    password: { ar: "كلمة المرور", en: "Password", ur: "پاس ورڈ" },
    specialization: { ar: "التخصص", en: "Specialization", ur: "تخصص" },
    experience: { ar: "سنوات الخبرة", en: "Years of Experience", ur: "تجربے کے سال" },
    signup: { ar: "إنشاء حساب", en: "Sign Up", ur: "سائن اپ" },
    error: { ar: "خطأ", en: "Error", ur: "خرابی" },
    haveAccount: { ar: "لديك حساب؟ تسجيل الدخول", en: "Have an account? Login", ur: "اکاؤنٹ ہے؟ لاگ اِن" },
  }), []);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      Alert.alert(texts.error[currentLanguage], "Name is required");
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert(texts.error[currentLanguage], "Valid email is required");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert(texts.error[currentLanguage], "Password must be at least 6 characters");
      return false;
    }
    return true;
  }, [formData, texts, currentLanguage]);

  const submit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const res = await apiFetch<{ id:string; name:string; email:string; accessToken:string; tokenType:string; }>(
        "/assistants/signup",
        { 
          method: "POST", 
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            specialization: formData.specialization,
            experience: formData.experience
          }) 
        }
      );
      
      await login(
        { 
          email: res.email, 
          name: res.name, 
          id: res.id, 
          userType: "assistant", 
          isLoggedIn: true,
          specialization: formData.specialization,
          experience: formData.experience
        },
        { accessToken: res.accessToken, tokenType: res.tokenType }
      );
      
      router.replace("/assistant/dashboard");
    } catch (e:any) {
      Alert.alert(texts.error[currentLanguage], e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, login, texts, currentLanguage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text }]}>
            {texts.title[currentLanguage]}
          </Text>
          
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
            placeholder={texts.name[currentLanguage]} 
            placeholderTextColor={theme.textSecondary}
            value={formData.name} 
            onChangeText={(value) => updateField('name', value)}
          />
          
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
            placeholder={texts.email[currentLanguage]} 
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none" 
            keyboardType="email-address" 
            value={formData.email} 
            onChangeText={(value) => updateField('email', value)}
          />
          
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
            placeholder={texts.password[currentLanguage]} 
            placeholderTextColor={theme.textSecondary}
            secureTextEntry 
            value={formData.password} 
            onChangeText={(value) => updateField('password', value)}
          />
          
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
            placeholder={texts.specialization[currentLanguage]} 
            placeholderTextColor={theme.textSecondary}
            value={formData.specialization} 
            onChangeText={(value) => updateField('specialization', value)}
          />
          
          <TextInput 
            style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
            placeholder={texts.experience[currentLanguage]} 
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={String(formData.experience)} 
            onChangeText={(value) => updateField('experience', parseInt(value) || 0)}
          />
          
          <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
            <LinearGradient colors={[theme.primary, theme.primary + 'CC']} style={styles.buttonGradient}>
              {loading ? <ActivityIndicator color="#FFF" /> : 
                <Text style={styles.buttonText}>{texts.signup[currentLanguage]}</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              {texts.haveAccount[currentLanguage]}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const lightTheme = { 
  background: "#F8FAFC", surface: "#FFFFFF", primary: "#F59E0B", 
  text: "#1F2937", textSecondary: "#6B7280", border: "#E5E7EB" 
};
const darkTheme = { 
  background: "#0F172A", surface: "#1E293B", primary: "#F59E0B", 
  text: "#F1F5F9", textSecondary: "#94A3B8", border: "#334155" 
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: { 
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16,
    backgroundColor: "#FFFFFF"
  },
  button: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
  buttonGradient: { paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  linkButton: { marginTop: 16, alignItems: "center" },
  linkText: { fontSize: 14 },
});
```

## 4. تحسين `messages.tsx`

### ❌ **المشكلة الحالية:**
```javascript
// مكون بسيط جداً
export default function AssistantMessages(){
  return (
    <View style={s.c}>
      <Text style={s.t}>Messages — Coming Soon</Text>
    </View>
  );
}
```

### ✅ **الحل المحسن:**
```javascript
// /app/frontend/app/assistant/messages.tsx
import React, { useState, useMemo, useRef } from "react";
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, 
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../contexts/UserContext";

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
};

export default function AssistantMessages() {
  const { appSettings } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const texts = useMemo(() => ({
    title: { ar: "رسائل المساعد", en: "Assistant Messages", ur: "اسسٹنٹ پیغامات" },
    placeholder: { ar: "اكتب رسالة...", en: "Type a message...", ur: "پیغام لکھیں..." },
    send: { ar: "إرسال", en: "Send", ur: "بھیجیں" },
    empty: { ar: "لا توجد رسائل", en: "No messages yet", ur: "ابھی تک کوئی پیغام نہیں" },
  }), []);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    
    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        { alignSelf: isUser ? 'flex-end' : 'flex-start' }
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? theme.primary : theme.surface,
            borderColor: theme.border
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? '#FFFFFF' : theme.text }
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {texts.empty[currentLanguage]}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <LinearGradient 
        colors={isDarkMode ? ["#1E293B","#334155"] : ["#FFFFFF","#F8FAFC"]} 
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {texts.title[currentLanguage]}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            placeholder={texts.placeholder[currentLanguage]}
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={[theme.primary, theme.primary + 'CC']}
              style={[
                styles.sendButtonGradient,
                { opacity: inputText.trim() ? 1 : 0.5 }
              ]}
            >
              <Text style={styles.sendButtonText}>{texts.send[currentLanguage]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const lightTheme = { 
  background: "#F8FAFC", surface: "#FFFFFF", primary: "#F59E0B", 
  text: "#1F2937", textSecondary: "#6B7280", border: "#E5E7EB" 
};
const darkTheme = { 
  background: "#0F172A", surface: "#1E293B", primary: "#F59E0B", 
  text: "#F1F5F9", textSecondary: "#94A3B8", border: "#334155" 
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  messagesList: { flexGrow: 1, padding: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, textAlign: "center" },
  messageContainer: { marginVertical: 4, maxWidth: "80%" },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageText: { fontSize: 14 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: { borderRadius: 12, overflow: "hidden" },
  sendButtonGradient: { paddingHorizontal: 16, paddingVertical: 10 },
  sendButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
});
```

---

## 🎯 **تعليمات محسّنة لـ ChatGPT:**

### **رسالة للنسخ واللصق:**

```markdown
# تعليمات تطوير تطبيق React Native + FastAPI

## 🎯 معايير الجودة الإلزامية:

### 1. **بنية Component React Native:**
```javascript
// ✅ النمط الصحيح دائماً:
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SafeAreaView, StatusBar, /* ... */ } from "react-native";
import { useUser } from "../contexts/UserContext";

export default function MyComponent() {
  const { userData, appSettings, getAuthHeaders } = useUser();
  const { isDarkMode, currentLanguage } = appSettings;
  const theme = isDarkMode ? darkTheme : lightTheme;

  // States
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // ✅ النصوص مع useMemo (إلزامي!)
  const texts = useMemo(() => ({
    title: { ar: "العنوان", en: "Title", ur: "ٹائٹل" }
  }), []);

  // ✅ Data loading مع useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiFetch('/endpoint', { headers: getAuthHeaders() });
      setData(result);
    } catch (error) {
      Alert.alert(texts.error[currentLanguage], error.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, texts, currentLanguage]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {loading ? <ActivityIndicator /> : <Content />}
    </SafeAreaView>
  );
}

// ✅ Themes منفصلة دائماً
const lightTheme = { background: "#F8FAFC", /* ... */ };
const darkTheme = { background: "#0F172A", /* ... */ };
```

### 2. **Backend FastAPI Pattern:**
```python
# ✅ النمط الصحيح دائماً:
@api_router.post("/endpoint")
async def my_endpoint(data: MyModel, current_user = Depends(get_current_user)):
    try:
        # Business logic
        result = await db.collection.find_one({"id": data.id})
        if not result:
            raise HTTPException(404, "Not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Internal error: {str(e)}")
```

### 3. **قواعد إلزامية:**
- ✅ دائماً استخدم `useMemo(() => ({ texts }), [])` للنصوص
- ✅ دائماً استخدم `useCallback` للدوال المعقدة  
- ✅ دائماً استخدم `process.env.EXPO_PUBLIC_BACKEND_URL`
- ✅ دائماً استخدم `getAuthHeaders()` للمصادقة
- ✅ دائماً أضف `try/catch` مع `Alert.alert`
- ✅ دائماً أضف loading states مع `ActivityIndicator`
- ✅ دائماً استخدم `SafeAreaView` و `StatusBar`
- ✅ دائماً أضف themes منفصلة (light/dark)

### 4. **أخطاء ممنوعة:**
- ❌ بيانات ثابتة بدون API calls
- ❌ نصوص بدون `useMemo`
- ❌ عدم معالجة الأخطاء
- ❌ عدم وجود loading states
- ❌ URLs مشفرة في الكود

## 🔧 الكود المقدم ممتاز (92/100) مع هذه التحسينات:
1. إضافة `useMemo` للنصوص في login.tsx
2. تحسين معالجة الأخطاء في apiFetch
3. إضافة صفحة signup كاملة
4. تطوير messages.tsx ليكون وظيفي

اتبع المعايير المذكورة وستحصل على كود مثالي!
```

---

## 📊 **التقييم النهائي:**

**الكود المُقدم ممتاز 92/100** مع التحسينات البسيطة المذكورة أعلاه ليصبح 100/100. 

**نقاط القوة:**
- معمارية متقدمة ومنظمة
- استخدام أفضل الممارسات
- فصل الاهتمامات بشكل ممتاز
- أداء محسن مع useCallback/useMemo
- معالجة أخطاء جيدة

**كود رائع ومطابق لمعاييري! 🎉**