import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  studentName: string;
  phoneNumber: string;
  email: string;
  universityName: string;
  universityId: string;
  joinDate: string;
  isLoggedIn: boolean;
  userType: 'student' | 'teacher';
  // Teacher specific fields
  name?: string;
  years_experience?: number;
  gpa?: number;
}

interface AppSettings {
  isDarkMode: boolean;
  currentLanguage: 'ar' | 'en' | 'ur';
}

interface UserContextType {
  userData: UserData;
  appSettings: AppSettings;
  setUserData: (data: Partial<UserData>) => void;
  login: (loginData: Partial<UserData>) => void;
  logout: () => void;
  updateProfile: (profileData: Partial<UserData>) => void;
  toggleDarkMode: () => void;
  changeLanguage: (language: 'ar' | 'en' | 'ur') => void;
}

const defaultUserData: UserData = {
  studentName: '',
  phoneNumber: '',
  email: '',
  universityName: '',
  universityId: '',
  joinDate: new Date().toISOString().split('T')[0],
  isLoggedIn: false,
  userType: 'student',
  // Teacher fields
  name: '',
  years_experience: 0,
  gpa: 0,
};

const defaultAppSettings: AppSettings = {
  isDarkMode: true, // تغيير النمط الافتراضي إلى المظلم
  currentLanguage: 'ar',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userData, setUserDataState] = useState<UserData>(defaultUserData);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved settings on app start
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        const savedDarkMode = await AsyncStorage.getItem('app_dark_mode');
        
        if (savedLanguage || savedDarkMode) {
          setAppSettings(prev => ({
            ...prev,
            currentLanguage: (savedLanguage as 'ar' | 'en' | 'ur') || prev.currentLanguage,
            isDarkMode: savedDarkMode === 'true' || prev.isDarkMode
          }));
          console.log('Loaded settings:', { language: savedLanguage, darkMode: savedDarkMode });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);

  const setUserData = (data: Partial<UserData>) => {
    setUserDataState(prev => ({ ...prev, ...data }));
  };

  const login = (loginData: Partial<UserData>) => {
    setUserDataState(prev => ({
      ...prev,
      ...loginData,
      isLoggedIn: true,
    }));
  };

  const logout = () => {
    setUserDataState(defaultUserData);
  };

  const updateProfile = (profileData: Partial<UserData>) => {
    setUserDataState(prev => ({ ...prev, ...profileData }));
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !appSettings.isDarkMode;
    setAppSettings(prev => ({ ...prev, isDarkMode: newDarkMode }));
    try {
      await AsyncStorage.setItem('app_dark_mode', newDarkMode.toString());
      console.log('Dark mode saved:', newDarkMode);
    } catch (error) {
      console.error('Error saving dark mode:', error);
    }
  };

  const changeLanguage = async (language: 'ar' | 'en' | 'ur') => {
    console.log('UserContext: Changing language to:', language);
    setAppSettings(prev => ({ ...prev, currentLanguage: language }));
    try {
      await AsyncStorage.setItem('app_language', language);
      console.log('Language saved:', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value: UserContextType = {
    userData,
    appSettings,
    setUserData,
    login,
    logout,
    updateProfile,
    toggleDarkMode,
    changeLanguage,
  };

  // Don't render children until settings are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};