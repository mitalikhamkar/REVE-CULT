import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import * as auth from "@/api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await auth.loginViaEmailPassword(email, password);
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthChecked(true);
    return loggedInUser;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const loggedInUser = await auth.loginWithGoogle();
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthChecked(true);
    return loggedInUser;
  }, []);

  const register = useCallback(async ({ email, password, full_name }) => {
    return auth.register({ email, password, full_name });
  }, []);

  const verifyOtp = useCallback(async ({ email, otpCode }) => {
    const result = await auth.verifyOtp({ email, otpCode });
    if (result?.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
    }
    return result;
  }, []);

  const resendOtp = useCallback(async (email) => auth.resendOtp(email), []);

  const resetPasswordRequest = useCallback(async (email) => auth.resetPasswordRequest(email), []);

  const resetPassword = useCallback(
    async ({ resetToken, newPassword }) => auth.resetPassword({ resetToken, newPassword }),
    []
  );

  const logout = useCallback((redirectTo = "/") => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authChecked,
        login,
        loginWithGoogle,
        register,
        verifyOtp,
        resendOtp,
        resetPasswordRequest,
        resetPassword,
        logout,
        navigateToLogin,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
