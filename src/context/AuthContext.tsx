// src/context/AuthContext.tsx
import { createContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const login = (t: string, r: string) => {
    setToken(t);
    setRole(r);
    localStorage.setItem('token', t);
    localStorage.setItem('role', r);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>{children}</AuthContext.Provider>
  );
};
