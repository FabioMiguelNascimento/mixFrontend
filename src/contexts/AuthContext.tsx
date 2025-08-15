
import { createContext, useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import api from '../services/api';


export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SELLER = 'SELLER',
  USER = 'USER',
}


const UserDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(UserRole),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type UserData = z.infer<typeof UserDataSchema>;

interface AuthContextType {
  isAuthenticated: boolean;
  user: Omit<UserData, 'accessToken' | 'refreshToken'> | null;
  token: string | null;
  login: (userData: UserData) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = UserDataSchema.parse(JSON.parse(storedUserData));
        setUserData(parsedData);
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem('userData');
      }
    }

    const syncTabs = (event: StorageEvent) => {
      if (event.key === 'userData') {
        if (event.newValue) {
          try {
            const parsedData = UserDataSchema.parse(JSON.parse(event.newValue));
            setUserData(parsedData);
          } catch (error) {
            console.error("Failed to parse user data from storage event", error);
          }
        } else {
          setUserData(null);
        }
      }
    };

    window.addEventListener('storage', syncTabs);

    return () => {
      window.removeEventListener('storage', syncTabs);
    };

  }, []);

  const login = (newUserData: UserData) => {
    const validatedData = UserDataSchema.parse(newUserData);
    localStorage.setItem('userData', JSON.stringify(validatedData));
    setUserData(validatedData);
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setUserData(null);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken: userData?.refreshToken });
      const { accessToken } = response.data.data;
      
      if (userData) {
        const newUserData = { ...userData, accessToken };
        setUserData(newUserData);
        localStorage.setItem('userData', JSON.stringify(newUserData));
        return accessToken;
      }
      return null;
    } catch (error) {
      logout();
      return null;
    }
  };

  const user = userData ? { id: userData.id, name: userData.name, email: userData.email, role: userData.role } : null;

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!userData, user, token: userData?.accessToken || null, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};