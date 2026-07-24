"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization_id?: string | null;
  institutionName?: string | null;
}

export async function getMetaMaskNonce(walletAddress: string): Promise<{ message: string; tempToken: string }> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000").replace(/\/api$/, "");
  const res = await fetch(`${baseUrl}/auth/admin/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to generate challenge nonce");
  return data;
}

export async function loginWithMetaMaskApi(
  walletAddress: string,
  signature: string,
  tempToken: string
): Promise<{ success: boolean; error?: string; accessToken?: string; user?: AdminUser }> {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000").replace(/\/api$/, "");
    const res = await fetch(`${baseUrl}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, signature, tempToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || "Wallet authorization failed" };
    }

    const accessToken = data.accessToken;
    const profile: AdminUser = {
      id: data.id,
      email: data.email || walletAddress,
      name: data.name || "System Admin",
      role: data.role || "super_admin",
    };

    return { success: true, accessToken, user: profile };
  } catch (err: any) {
    return { success: false, error: err?.message || "MetaMask login failed" };
  }
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  getMetaMaskNonce: (walletAddress: string) => Promise<{ message: string; tempToken: string }>;
  loginWithMetaMask: (walletAddress: string, signature: string, tempToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  getMetaMaskNonce,
  loginWithMetaMask: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("admin_token");
      const storedUser = localStorage.getItem("admin_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to restore admin auth state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithMetaMask = async (walletAddress: string, signature: string, tempToken: string) => {
    const result = await loginWithMetaMaskApi(walletAddress, signature, tempToken);
    if (result.success && result.accessToken && result.user) {
      setToken(result.accessToken);
      setUser(result.user);
      localStorage.setItem("admin_token", result.accessToken);
      localStorage.setItem("admin_user", JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, getMetaMaskNonce, loginWithMetaMask, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
