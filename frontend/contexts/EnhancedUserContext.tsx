import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== تعريف الأنواع المحسنة =====
interface BaseUserData {
  name?: string;
  email?: string;
  phone?: string;
  isLoggedIn: boolean;
  userType: 'student' | 'teacher' | null;
  id?: string;
  joinDate?: string;
  preferences?: {
    language: 'ar' | 'en' | 'ur';
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface StudentData extends BaseUserData {
  userType: 'student';
  studentName?: string;
  universityName?: string;
  universityId?: string;
  studentId?: string;
  level?: string;
  major?: string;
}

interface TeacherData extends BaseUserData {
  userType: 'teacher';
  university?: string;
  yearsExperience?: number;
  gpa?: number;
  subjects?: string[];
  hourlyRate?: number;
  bio?: string;
  qualifications?: string[];
  availableHours?: {
    [key: string]: string[]; // day: [time slots]
  };
}

type UserData = StudentData | TeacherData | (BaseUserData & { userType: null });

interface AppSettings {
  isDarkMode: boolean;
  currentLanguage: 'ar' | 'en' | 'ur';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    sessionReminders: boolean;
    newMessages: boolean;
    ratings: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
  };
}

interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
}

interface UserContextType {
  // البيانات الأساسية
  userData: UserData;
  appSettings: AppSettings;
  authTokens: AuthTokens;
  
  // حالات التطبيق
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // دوال المصادقة
  login: (loginData: Partial<UserData>, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserData>) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // إعدادات التطبيق
  toggleDarkMode: () => Promise<void>;
  changeLanguage: (language: 'ar' | 'en' | 'ur') => Promise<void>;
  updateNotificationSettings: (settings: Partial<AppSettings['notifications']>) => Promise<void>;
  updateAccessibilitySettings: (settings: Partial<AppSettings['accessibility']>) => Promise<void>;
  
  // دوال المساعدة
  getUserType: () => 'student' | 'teacher' | null;
  getAuthHeaders: () => Record<string, string>;
  isStudent: () => boolean;
  isTeacher: () => boolean;
  getDisplayName: () => string;
  getProfileImage: () => string;
  
  // دوال البيانات
  syncUserData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

// ===== القيم الافتراضية =====
const defaultUserData: UserData = {
  name: '',
  email: '',
  phone: '',
  isLoggedIn: false,
  userType: null,
  preferences: {
    language: 'ar',
    theme: 'dark',
    notifications: true,
  },
};

const defaultAppSettings: AppSettings = {
  isDarkMode: true, // النمط الليلي افتراضي
  currentLanguage: 'ar', // العربية افتراضية
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    sessionReminders: true,
    newMessages: true,
    ratings: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
  },
};

const defaultAuthTokens: AuthTokens = {};

// ===== إنشاء السياق =====
const UserContext = createContext<UserContextType | undefined>(undefined);

// ===== Hook للوصول للسياق =====
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// ===== موفر السياق المحسن =====
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // ===== الحالات =====
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [authTokens, setAuthTokens] = useState<AuthTokens>(defaultAuthTokens);
  const [isLoading, setIsLoading] = useState(true);

  // ===== تحميل البيانات عند بدء التطبيق =====
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setIsLoading(true);
        
        // تحميل بيانات المستخدم
        const storedUserData = await AsyncStorage.getItem('@userData');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
        }

        // تحميل إعدادات التطبيق
        const storedSettings = await AsyncStorage.getItem('@appSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setAppSettings({ ...defaultAppSettings, ...parsedSettings });
        }

        // تحميل التوكنات
        const storedTokens = await AsyncStorage.getItem('@authTokens');
        if (storedTokens) {
          const parsedTokens = JSON.parse(storedTokens);
          setAuthTokens(parsedTokens);
          
          // التحقق من صحة التوكن
          if (parsedTokens.accessToken) {
            await validateToken(parsedTokens.accessToken);
          }
        }

        console.log('✅ تم تحميل البيانات المحفوظة بنجاح');
      } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        // مسح البيانات التالفة
        await clearAllData();
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // ===== دوال المصادقة المحسنة =====
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return true;
      } else {
        // التوكن غير صالح
        await logout();
        return false;
      }
    } catch (error) {
      console.error('خطأ في التحقق من التوكن:', error);
      return false;
    }
  };

  const login = async (loginData: Partial<UserData>, tokens: AuthTokens): Promise<void> => {
    try {
      const newUserData: UserData = {
        ...defaultUserData,
        ...loginData,
        isLoggedIn: true,
        joinDate: loginData.joinDate || new Date().toISOString(),
      };

      // حفظ البيانات في الحالة
      setUserData(newUserData);
      setAuthTokens(tokens);

      // حفظ البيانات في التخزين المحلي
      await AsyncStorage.setItem('@userData', JSON.stringify(newUserData));
      await AsyncStorage.setItem('@authTokens', JSON.stringify(tokens));

      // تحديث آخر تسجيل دخول
      await AsyncStorage.setItem('@lastLogin', new Date().toISOString());

      console.log('✅ تم تسجيل الدخول بنجاح:', newUserData.userType);
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // إشعار الخادم بتسجيل الخروج
      if (authTokens.accessToken) {
        try {
          await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authTokens.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('تعذر إشعار الخادم بتسجيل الخروج:', error);
        }
      }

      // مسح البيانات من الحالة
      setUserData(defaultUserData);
      setAuthTokens(defaultAuthTokens);

      // مسح البيانات من التخزين المحلي
      await AsyncStorage.multiRemove(['@userData', '@authTokens', '@lastLogin']);

      console.log('✅ تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
    }
  };

  const updateProfile = async (profileData: Partial<UserData>): Promise<void> => {
    try {
      const updatedUserData = { ...userData, ...profileData };
      
      // تحديث على الخادم
      if (authTokens.accessToken) {
        const endpoint = userData.userType === 'student' 
          ? '/api/students/profile' 
          : '/api/teachers/profile';
          
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authTokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          throw new Error('فشل في تحديث البيانات على الخادم');
        }
      }

      // تحديث البيانات محلياً
      setUserData(updatedUserData);
      await AsyncStorage.setItem('@userData', JSON.stringify(updatedUserData));
      
      console.log('✅ تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحديث الملف الشخصي:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!authTokens.refreshToken) {
        return false;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: authTokens.refreshToken }),
      });

      if (response.ok) {
        const newTokens = await response.json();
        const updatedTokens = { ...authTokens, ...newTokens };
        
        setAuthTokens(updatedTokens);
        await AsyncStorage.setItem('@authTokens', JSON.stringify(updatedTokens));
        
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('خطأ في تحديث التوكن:', error);
      return false;
    }
  };

  // ===== دوال الإعدادات المحسنة =====
  const toggleDarkMode = async (): Promise<void> => {
    try {
      const newSettings = { 
        ...appSettings, 
        isDarkMode: !appSettings.isDarkMode 
      };
      
      setAppSettings(newSettings);
      await AsyncStorage.setItem('@appSettings', JSON.stringify(newSettings));
      
      console.log('✅ تم تغيير النمط:', newSettings.isDarkMode ? 'ليلي' : 'نهاري');
    } catch (error) {
      console.error('❌ خطأ في تغيير النمط:', error);
    }
  };

  const changeLanguage = async (language: 'ar' | 'en' | 'ur'): Promise<void> => {
    try {
      const newSettings = { 
        ...appSettings, 
        currentLanguage: language 
      };
      
      setAppSettings(newSettings);
      await AsyncStorage.setItem('@appSettings', JSON.stringify(newSettings));
      
      console.log('✅ تم تغيير اللغة إلى:', language);
    } catch (error) {
      console.error('❌ خطأ في تغيير اللغة:', error);
    }
  };

  const updateNotificationSettings = async (settings: Partial<AppSettings['notifications']>): Promise<void> => {
    try {
      const newSettings = {
        ...appSettings,
        notifications: { ...appSettings.notifications, ...settings }
      };
      
      setAppSettings(newSettings);
      await AsyncStorage.setItem('@appSettings', JSON.stringify(newSettings));
      
      console.log('✅ تم تحديث إعدادات الإشعارات');
    } catch (error) {
      console.error('❌ خطأ في تحديث إعدادات الإشعارات:', error);
    }
  };

  const updateAccessibilitySettings = async (settings: Partial<AppSettings['accessibility']>): Promise<void> => {
    try {
      const newSettings = {
        ...appSettings,
        accessibility: { ...appSettings.accessibility, ...settings }
      };
      
      setAppSettings(newSettings);
      await AsyncStorage.setItem('@appSettings', JSON.stringify(newSettings));
      
      console.log('✅ تم تحديث إعدادات الوصول');
    } catch (error) {
      console.error('❌ خطأ في تحديث إعدادات الوصول:', error);
    }
  };

  // ===== دوال المساعدة المحسنة =====
  const getUserType = (): 'student' | 'teacher' | null => {
    return userData.userType;
  };

  const isAuthenticated = (): boolean => {
    return userData.isLoggedIn && !!authTokens.accessToken;
  };

  const isStudent = (): boolean => {
    return userData.userType === 'student';
  };

  const isTeacher = (): boolean => {
    return userData.userType === 'teacher';
  };

  const getDisplayName = (): string => {
    if (userData.userType === 'student') {
      return (userData as StudentData).studentName || userData.name || 'طالب';
    } else if (userData.userType === 'teacher') {
      return userData.name || 'معلم';
    }
    return 'مستخدم';
  };

  const getProfileImage = (): string => {
    // يمكن إرجاع URL للصورة أو الحرف الأول
    return getDisplayName().charAt(0).toUpperCase();
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authTokens.accessToken) {
      headers['Authorization'] = `Bearer ${authTokens.accessToken}`;
    }

    return headers;
  };

  const syncUserData = async (): Promise<void> => {
    try {
      if (!isAuthenticated()) {
        return;
      }

      const endpoint = userData.userType === 'student' 
        ? '/api/students/profile' 
        : '/api/teachers/profile';

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const serverUserData = await response.json();
        const updatedUserData = { ...userData, ...serverUserData };
        
        setUserData(updatedUserData);
        await AsyncStorage.setItem('@userData', JSON.stringify(updatedUserData));
        
        console.log('✅ تم مزامنة بيانات المستخدم');
      }
    } catch (error) {
      console.error('❌ خطأ في مزامنة البيانات:', error);
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      // مسح جميع البيانات المحفوظة
      await AsyncStorage.multiRemove([
        '@userData', 
        '@appSettings', 
        '@authTokens', 
        '@lastLogin'
      ]);
      
      // إعادة تعيين الحالات للقيم الافتراضية
      setUserData(defaultUserData);
      setAppSettings(defaultAppSettings);
      setAuthTokens(defaultAuthTokens);
      
      console.log('✅ تم مسح جميع البيانات');
    } catch (error) {
      console.error('❌ خطأ في مسح البيانات:', error);
    }
  };

  // ===== القيمة المرجعة =====
  const contextValue: UserContextType = {
    // البيانات الأساسية
    userData,
    appSettings,
    authTokens,
    isLoading,
    isAuthenticated: isAuthenticated(),
    
    // دوال المصادقة
    login,
    logout,
    updateProfile,
    refreshToken,
    
    // إعدادات التطبيق
    toggleDarkMode,
    changeLanguage,
    updateNotificationSettings,
    updateAccessibilitySettings,
    
    // دوال المساعدة
    getUserType,
    getAuthHeaders,
    isStudent,
    isTeacher,
    getDisplayName,
    getProfileImage,
    
    // دوال البيانات
    syncUserData,
    clearAllData,
  };

  // عرض مؤشر التحميل حتى يتم تحميل البيانات
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* يمكن إضافة مكون Loading مخصص هنا */}
      </View>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ===== التصدير =====
export type { 
  UserData, 
  StudentData, 
  TeacherData, 
  AppSettings, 
  AuthTokens, 
  UserContextType 
};

export { UserContext };
export default UserProvider;