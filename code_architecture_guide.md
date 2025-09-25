# 🏗️ دليل بناء الأكواد المتقدم - منهجيتي الفنية

## 📚 **جدول المحتويات:**
1. [منهجيتي في بناء الأكواد](#منهجيتي)
2. [الأسس التقنية المتبعة](#الأسس-التقنية)
3. [تحليل شامل لتطبيق My Pocket Tutor](#تحليل-التطبيق)
4. [بنية المشروع والعلاقات](#بنية-المشروع)
5. [أنماط التصميم المستخدمة](#أنماط-التصميم)
6. [التوجيهات الفنية المتقدمة](#التوجيهات-المتقدمة)

---

## 🎯 **منهجيتي في بناء الأكواد** {#منهجيتي}

### **1. مبدأ "Architecture First" - البنية أولاً**

```
📐 التفكير المعماري:
┌─────────────────────────────────────┐
│ 1. فهم المتطلبات والسياق           │
│ 2. تصميم البنية العامة             │
│ 3. تحديد نقاط التكامل              │
│ 4. كتابة الكود بناءً على التصميم    │
│ 5. التحسين والتطوير المستمر        │
└─────────────────────────────────────┘
```

### **2. مبدأ "Clean Code Principles" - مبادئ الكود النظيف**

#### **أ. قابلية القراءة (Readability):**
```javascript
// ❌ سيء - غير واضح
const f = (u) => u.n || 'Unknown';

// ✅ جيد - واضح ومفهوم
const formatUserName = (userData) => userData.name || 'Unknown User';
```

#### **ب. الوحدة الوظيفية (Single Responsibility):**
```javascript
// ❌ سيء - مسؤوليات متعددة
const UserComponent = () => {
  // تحميل البيانات + عرض + معالجة الأحداث + تنسيق
};

// ✅ جيد - مسؤولية واحدة
const useUserData = () => { /* تحميل البيانات */ };
const UserDisplay = () => { /* عرض فقط */ };
const UserActions = () => { /* معالجة الأحداث */ };
```

#### **ج. إعادة الاستخدام (Reusability):**
```javascript
// ✅ مكون قابل للإعادة
const StatCard = ({ title, value, icon, theme }) => (
  <View style={[styles.card, { backgroundColor: theme.surface }]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
  </View>
);
```

### **3. مبدأ "Performance First" - الأداء أولاً**

#### **أ. تحسين إعادة الرسم (Re-render Optimization):**
```javascript
// ✅ استخدام useMemo للبيانات الثابتة
const texts = useMemo(() => ({
  title: { ar: "العنوان", en: "Title", ur: "ٹائٹل" }
}), []);

// ✅ استخدام useCallback للدوال المعقدة
const handleSubmit = useCallback(async (data) => {
  // معالجة البيانات
}, [dependency1, dependency2]);

// ✅ React.memo للمكونات الثقيلة
const ExpensiveComponent = React.memo(({ data, theme }) => {
  // مكون معقد
});
```

#### **ب. تحسين شبكة الإنترنت (Network Optimization):**
```javascript
// ✅ معالجة الأخطاء الشاملة
const loadData = useCallback(async () => {
  try {
    setLoading(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    setData(data);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request timeout');
    } else {
      console.error('Network error:', error);
      Alert.alert('خطأ', 'فشل في تحميل البيانات');
    }
  } finally {
    setLoading(false);
  }
}, [getAuthHeaders]);
```

---

## 🔧 **الأسس التقنية المتبعة** {#الأسس-التقنية}

### **1. هيكلة المكونات (Component Architecture)**

```
📦 بنية المكون النموذجي:
┌─────────────────────────────────────┐
│ 1. الاستيرادات (Imports)            │
│ 2. النوع/الواجهات (Types/Interfaces)│
│ 3. المتغيرات الثابتة (Constants)    │
│ 4. المكون الرئيسي (Main Component)  │
│   ├── استخراج السياق (Context)      │
│   ├── الحالات المحلية (Local States)│
│   ├── النصوص المحلية (Memoized)     │
│   ├── تحميل البيانات (Data Loading) │
│   ├── معالجة الأحداث (Event Handlers)│
│   └── الرسم (Render Logic)          │
│ 5. الأنماط (Styles)                │
│ 6. التصدير (Export)                │
└─────────────────────────────────────┘
```

### **2. إدارة الحالة (State Management Strategy)**

#### **أ. الحالة المحلية vs العامة:**
```javascript
// الحالة المحلية - للواجهة فقط
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({});

// الحالة العامة - للمشاركة
const { userData, appSettings, updateProfile } = useUser();
```

#### **ب. أنماط التحديث:**
```javascript
// ✅ نمط التحديث الآمن
const updateUserProfile = useCallback((newData) => {
  // تحديث الحالة المحلية فوراً (Optimistic Update)
  setFormData(prev => ({ ...prev, ...newData }));
  
  // تحديث الخادم
  updateProfileOnServer(newData)
    .then(() => {
      // تحديث السياق العام عند النجاح
      updateProfile(newData);
    })
    .catch(() => {
      // إعادة الحالة السابقة عند الفشل
      setFormData(prev => ({ ...prev }));
    });
}, [updateProfile]);
```

### **3. معمارية API (API Architecture)**

#### **أ. تغليف طلبات API:**
```javascript
// ✅ فئة منظمة لطلبات API
class ApiClient {
  constructor(baseURL, getAuthHeaders) {
    this.baseURL = baseURL;
    this.getAuthHeaders = getAuthHeaders;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // طرق متخصصة
  get = (endpoint) => this.request(endpoint);
  post = (endpoint, data) => this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  put = (endpoint, data) => this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
}
```

#### **ب. معالجة الأخطاء المتدرجة:**
```javascript
// ✅ معالجة أخطاء متطورة
const handleApiError = (error, context, texts, currentLanguage) => {
  let message = texts.genericError[currentLanguage];
  
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
  }
  
  Alert.alert(texts.error[currentLanguage], message);
  
  // تسجيل الخطأ للمراقبة
  console.error(`[${context}] API Error:`, {
    status: error.status,
    message: error.message,
    timestamp: new Date().toISOString()
  });
};
```

---

## 📱 **تحليل شامل لتطبيق My Pocket Tutor** {#تحليل-التطبيق}

### **1. نظرة عامة على المعمارية**

```
🏢 معمارية التطبيق:
┌─────────────────────────────────────┐
│           Frontend (Expo)           │
│  ┌─────────────────────────────────┐ │
│  │     React Native App            │ │
│  │  ┌─────────┬─────────┬────────┐ │ │
│  │  │ Student │ Teacher │Assistant│ │ │
│  │  │   UI    │   UI    │   UI   │ │ │
│  │  └─────────┴─────────┴────────┘ │ │
│  │                                 │ │
│  │      UserContext (Global)       │ │
│  │       ┌─────────────────┐       │ │
│  │       │ Authentication  │       │ │
│  │       │ Theme/Language  │       │ │
│  │       │ User Data       │       │ │
│  │       └─────────────────┘       │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    ↕ HTTP/REST
┌─────────────────────────────────────┐
│          Backend (FastAPI)          │
│  ┌─────────────────────────────────┐ │
│  │         API Routes              │ │
│  │  ┌─────────┬─────────┬────────┐ │ │
│  │  │Students │Teachers │Assistant│ │ │
│  │  │   API   │   API   │   API  │ │ │
│  │  └─────────┴─────────┴────────┘ │ │
│  │                                 │ │
│  │      Authentication Layer       │ │
│  │       ┌─────────────────┐       │ │
│  │       │ JWT Validation  │       │ │
│  │       │ Password Hash   │       │ │
│  │       │ Role Check      │       │ │
│  │       └─────────────────┘       │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    ↕ MongoDB Driver
┌─────────────────────────────────────┐
│         Database (MongoDB)          │
│  ┌─────────────────────────────────┐ │
│  │         Collections             │ │
│  │  ┌─────────┬─────────┬────────┐ │ │
│  │  │students │teachers │assistant│ │ │
│  │  └─────────┴─────────┴────────┘ │ │
│  │  ┌─────────┬─────────┬────────┐ │ │
│  │  │bookings │messages │sessions│ │ │
│  │  └─────────┴─────────┴────────┘ │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **2. تفصيل بنية Frontend**

#### **أ. نظام التوجيه (Routing System):**
```
📁 /app/frontend/app/ (Expo Router)
├── index.tsx                    # صفحة الترحيب الرئيسية
├── _layout.tsx                  # تخطيط التطبيق الأساسي
├── student/                     # واجهة الطالب
│   ├── login.tsx               # تسجيل دخول الطالب
│   ├── signup.tsx              # إنشاء حساب الطالب
│   ├── dashboard.tsx           # لوحة تحكم الطالب
│   ├── messages.tsx            # نظام الرسائل المتقدم
│   ├── profile.tsx             # الملف الشخصي للطالب
│   ├── book-session.tsx        # حجز الجلسات
│   └── unified-booking.tsx     # النظام الموحد للحجز
├── teacher/                     # واجهة المعلم
│   ├── login.tsx               # تسجيل دخول المعلم
│   ├── signup.tsx              # إنشاء حساب المعلم
│   └── dashboard.tsx           # لوحة تحكم المعلم
└── assistant/                   # واجهة المساعد
    ├── login.tsx               # تسجيل دخول المساعد
    ├── signup.tsx              # إنشاء حساب المساعد
    ├── dashboard.tsx           # لوحة تحكم المساعد
    ├── messages.tsx            # نظام رسائل المساعد
    └── profile.tsx             # ملف المساعد الشخصي
```

#### **ب. نظام إدارة الحالة العامة (UserContext):**
```typescript
// بنية UserContext المفصلة
interface UserContextType {
  // بيانات المستخدم
  userData: {
    // بيانات مشتركة
    email: string;
    isLoggedIn: boolean;
    userType: 'student' | 'teacher' | 'assistant';
    
    // بيانات الطالب
    studentName?: string;
    phoneNumber?: string;
    universityName?: string;
    universityId?: string;
    
    // بيانات المعلم/المساعد
    name?: string;
    id?: string;
    specialization?: string;
    experience?: number;
    years_experience?: number;
    gpa?: number;
  };
  
  // إعدادات التطبيق
  appSettings: {
    isDarkMode: boolean;
    currentLanguage: 'ar' | 'en' | 'ur';
  };
  
  // بيانات المصادقة
  authData: {
    accessToken: string;
    tokenType: string;
  } | null;
  
  // دوال الإدارة
  login: (userData: Partial<UserData>, authData?: AuthData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserData>) => void;
  toggleDarkMode: () => Promise<void>;
  changeLanguage: (language: 'ar' | 'en' | 'ur') => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}
```

#### **ج. نظام النصوص متعددة اللغات:**
```javascript
// نمط التطبيق المتقدم للترجمة
const texts = useMemo(() => ({
  // العناوين الرئيسية
  titles: {
    dashboard: { 
      ar: "لوحة التحكم", 
      en: "Dashboard", 
      ur: "ڈیش بورڈ" 
    },
    profile: { 
      ar: "الملف الشخصي", 
      en: "Profile", 
      ur: "پروفائل" 
    }
  },
  
  // أزرار التفاعل
  actions: {
    save: { ar: "حفظ", en: "Save", ur: "محفوظ کریں" },
    cancel: { ar: "إلغاء", en: "Cancel", ur: "منسوخ" },
    edit: { ar: "تعديل", en: "Edit", ur: "ترمیم" }
  },
  
  // رسائل الحالة
  status: {
    loading: { ar: "جاري التحميل...", en: "Loading...", ur: "لوڈ ہو رہا ہے..." },
    success: { ar: "تم بنجاح", en: "Success", ur: "کامیاب" },
    error: { ar: "خطأ", en: "Error", ur: "خرابی" }
  },
  
  // رسائل التحقق
  validation: {
    required: { ar: "هذا الحقل مطلوب", en: "This field is required", ur: "یہ فیلڈ ضروری ہے" },
    email: { ar: "بريد إلكتروني غير صحيح", en: "Invalid email", ur: "غلط ای میل" },
    minLength: { ar: "أقل من الحد المطلوب", en: "Too short", ur: "بہت چھوٹا" }
  }
}), []);
```

### **3. تفصيل بنية Backend**

#### **أ. هيكل الخادم (Server Structure):**
```python
# /app/backend/server.py - البنية المفصلة

# 1. الاستيرادات والإعدادات
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import os
from dotenv import load_dotenv

# 2. تكوين قاعدة البيانات
load_dotenv()
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# 3. نظام المصادقة
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# 4. النماذج (Models)
class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: EmailStr
    university_name: str
    student_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class Teacher(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    specialization: Optional[str] = ""
    years_experience: Optional[int] = 0
    gpa: Optional[float] = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class Assistant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    specialization: Optional[str] = ""
    experience: Optional[int] = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

# 5. دوال المساعدة
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 6. middleware المصادقة
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # البحث في جميع المجموعات
    user = await db.students.find_one({"email": email})
    if user:
        return {"type": "student", "data": user}
        
    user = await db.teachers.find_one({"email": email})
    if user:
        return {"type": "teacher", "data": user}
        
    user = await db.assistants.find_one({"email": email})
    if user:
        return {"type": "assistant", "data": user}
    
    raise credentials_exception
```

#### **ب. نظام API Routes:**
```python
# نمط تنظيم المسارات
api_router = APIRouter(prefix="/api")

# مسارات الطلاب
@api_router.post("/students/signup")
async def student_signup(student_data: StudentSignup):
    # منطق إنشاء حساب الطالب
    pass

@api_router.post("/students/login")
async def student_login(login_data: StudentLogin):
    # منطق تسجيل دخول الطالب
    pass

@api_router.get("/students/profile")
async def get_student_profile(current_user = Depends(get_current_user)):
    # استرجاع بيانات الطالب
    pass

# مسارات المعلمين
@api_router.post("/teachers/signup")
async def teacher_signup(teacher_data: TeacherSignup):
    # منطق إنشاء حساب المعلم
    pass

# مسارات المساعدين
@api_router.post("/assistants/signup")
async def assistant_signup(assistant_data: AssistantSignup):
    # منطق إنشاء حساب المساعد
    pass

# مسارات المشتركة
@api_router.post("/ai-chat")
async def ai_chat(message_data: ChatMessage):
    # نظام المساعد الذكي
    pass

@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, current_user = Depends(get_current_user)):
    # نظام الحجوزات
    pass
```

---

## 🎨 **أنماط التصميم المستخدمة** {#أنماط-التصميم}

### **1. نمط المزود (Provider Pattern)**
```javascript
// تطبيق نمط Context Provider
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(defaultUserData);
  const [appSettings, setAppSettings] = useState(defaultAppSettings);
  
  // منطق إدارة الحالة العامة
  const contextValue = {
    userData,
    appSettings,
    login: useCallback(async (loginData, authData) => {
      // منطق تسجيل الدخول
    }, []),
    logout: useCallback(async () => {
      // منطق تسجيل الخروج
    }, [])
  };
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
```

### **2. نمط Hook المخصص (Custom Hook Pattern)**
```javascript
// Hook لإدارة API calls
const useApiCall = (endpoint, dependencies = []) => {
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
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, getAuthHeaders, ...dependencies]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};

// استخدام Hook
const AssistantDashboard = () => {
  const { data: stats, loading, error, refetch } = useApiCall('/api/assistants/profile');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <DashboardContent stats={stats} onRefresh={refetch} />;
};
```

### **3. نمط المكون المركب (Compound Component Pattern)**
```javascript
// نمط المكون المركب للنماذج
const Form = ({ children, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const contextValue = {
    formData,
    errors,
    updateField: (name, value) => setFormData(prev => ({ ...prev, [name]: value })),
    setFieldError: (name, error) => setErrors(prev => ({ ...prev, [name]: error }))
  };
  
  return (
    <FormContext.Provider value={contextValue}>
      <View onSubmit={() => onSubmit(formData)}>
        {children}
      </View>
    </FormContext.Provider>
  );
};

const FormField = ({ name, label, validation, ...props }) => {
  const { formData, errors, updateField, setFieldError } = useContext(FormContext);
  
  const handleChange = (value) => {
    updateField(name, value);
    
    // التحقق الفوري
    if (validation) {
      const error = validation(value);
      setFieldError(name, error);
    }
  };
  
  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        value={formData[name] || ''}
        onChangeText={handleChange}
        {...props}
      />
      {errors[name] && <Text style={styles.error}>{errors[name]}</Text>}
    </View>
  );
};

// الاستخدام
<Form onSubmit={handleSubmit}>
  <FormField name="name" label="الاسم" validation={validateName} />
  <FormField name="email" label="البريد" validation={validateEmail} />
</Form>
```

---

## 🚀 **التوجيهات الفنية المتقدمة** {#التوجيهات-المتقدمة}

### **1. إدارة الأداء المتقدمة**

#### **أ. تحسين Bundle Size:**
```javascript
// ✅ التحميل الكسول للمكونات الثقيلة
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// ✅ تقسيم الكود حسب المسارات
const StudentDashboard = React.lazy(() => import('./student/dashboard'));
const TeacherDashboard = React.lazy(() => import('./teacher/dashboard'));

// ✅ مكون الحمولة المؤقتة
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);
```

#### **ب. تحسين الذاكرة (Memory Optimization):**
```javascript
// ✅ تنظيف الموارد
useEffect(() => {
  const subscription = someService.subscribe();
  const timeout = setTimeout(() => {}, 5000);
  
  return () => {
    subscription.unsubscribe();
    clearTimeout(timeout);
  };
}, []);

// ✅ تحسين القوائم الطويلة
import { FlashList } from '@shopify/flash-list';

const OptimizedList = ({ data }) => (
  <FlashList
    data={data}
    renderItem={({ item }) => <ListItem item={item} />}
    estimatedItemSize={100}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
  />
);
```

### **2. إدارة الأخطاء المتقدمة**

#### **أ. Error Boundary مخصص:**
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // تسجيل الخطأ للمراقبة
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // إرسال تقرير الخطأ للخادم
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        })
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

#### **ب. نظام التسجيل المتقدم:**
```javascript
// نظام تسجيل مستويات متعددة
class Logger {
  static levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  static currentLevel = __DEV__ ? Logger.levels.DEBUG : Logger.levels.ERROR;

  static log(level, message, extra = {}) {
    if (level <= Logger.currentLevel) {
      const timestamp = new Date().toISOString();
      const logData = {
        timestamp,
        level: Object.keys(Logger.levels)[level],
        message,
        ...extra
      };

      console.log(`[${logData.level}] ${timestamp}: ${message}`, extra);

      // إرسال للخادم في الإنتاج
      if (!__DEV__ && level <= Logger.levels.WARN) {
        Logger.sendToServer(logData);
      }
    }
  }

  static error = (message, extra) => Logger.log(Logger.levels.ERROR, message, extra);
  static warn = (message, extra) => Logger.log(Logger.levels.WARN, message, extra);
  static info = (message, extra) => Logger.log(Logger.levels.INFO, message, extra);
  static debug = (message, extra) => Logger.log(Logger.levels.DEBUG, message, extra);

  static async sendToServer(logData) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }
}

// الاستخدام
Logger.info('User logged in', { userId: userData.id });
Logger.error('API call failed', { endpoint: '/api/profile', error: error.message });
```

### **3. نظام الاختبار المتقدم**

#### **أ. اختبارات الوحدة (Unit Tests):**
```javascript
// اختبار Hook مخصص
import { renderHook, act } from '@testing-library/react-hooks';
import { useApiCall } from '../hooks/useApiCall';

describe('useApiCall', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test User' };
    fetch.mockResponseOnce(JSON.stringify(mockData));

    const { result, waitForNextUpdate } = renderHook(() => 
      useApiCall('/api/user')
    );

    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle error correctly', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    const { result, waitForNextUpdate } = renderHook(() => 
      useApiCall('/api/user')
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

#### **ب. اختبارات التكامل (Integration Tests):**
```javascript
// اختبار تدفق المصادقة الكامل
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserProvider } from '../contexts/UserContext';
import LoginScreen from '../screens/LoginScreen';

const renderWithProvider = (component) => {
  return render(
    <UserProvider>
      {component}
    </UserProvider>
  );
};

describe('Login Flow', () => {
  it('should complete login process successfully', async () => {
    fetch.mockResponseOnce(JSON.stringify({
      accessToken: 'fake-token',
      user: { id: 1, name: 'Test User' }
    }));

    const { getByPlaceholderText, getByText } = renderWithProvider(
      <LoginScreen />
    );

    const emailInput = getByPlaceholderText('البريد الإلكتروني');
    const passwordInput = getByPlaceholderText('كلمة المرور');
    const loginButton = getByText('تسجيل الدخول');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/students/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );
    });
  });
});
```

---

## 📊 **ملخص المعمارية الشاملة**

### **المبادئ الأساسية:**
1. **الفصل بين الاهتمامات** - كل مكون له مسؤولية واحدة
2. **إعادة الاستخدام** - مكونات قابلة للإعادة والتخصيص
3. **الأداء الأمثل** - تحسين الذاكرة والشبكة
4. **التجربة المتسقة** - تصميم موحد عبر التطبيق
5. **القابلية للصيانة** - كود واضح وموثق
6. **الأمان** - حماية البيانات والمصادقة الآمنة

### **التدفق التقني:**
```
📱 User Action → 🔄 State Update → 🌐 API Call → 🗄️ Database → 
📤 Response → 🔄 State Update → 🎨 UI Re-render → 👀 User Feedback
```

هذه المعمارية تضمن تطبيقاً قوياً، قابلاً للتطوير، وسهل الصيانة، مع الحفاظ على أفضل الممارسات في التطوير الحديث.