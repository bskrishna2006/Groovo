import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = '/api';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  company?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  expertise?: string[];
  rating?: number;
  sessionsCompleted?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, role: string, name: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify existing token
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data.user;
  };

  const signup = async (email: string, password: string, role: string, name: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, fullName: name }),
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Signup failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const profile = user;

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, profile, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
