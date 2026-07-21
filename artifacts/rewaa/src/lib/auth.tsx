import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetMe, useLogout } from '@workspace/api-client-react';
import type { UserProfile } from '@workspace/api-client-react/src/generated/api.schemas';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginUser: (user: UserProfile) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('rewaa_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data: meData, isLoading, isError } = useGetMe({
    query: {
      retry: false,
      staleTime: Infinity,
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        setUser(null);
        localStorage.removeItem('rewaa_user');
        queryClient.clear();
      }
    }
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
      localStorage.setItem('rewaa_user', JSON.stringify(meData));
    } else if (isError) {
      setUser(null);
      localStorage.removeItem('rewaa_user');
    }
  }, [meData, isError]);

  const loginUser = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('rewaa_user', JSON.stringify(newUser));
  };

  const logoutUser = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
