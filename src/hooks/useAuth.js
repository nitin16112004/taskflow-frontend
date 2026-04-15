import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export default function useAuth() {
  const { authUser, token, isAuthenticated, login, register, logout, loading } = useApp();

  return useMemo(
    () => ({
      user: authUser,
      token,
      isAuthenticated,
      login,
      register,
      logout,
      authLoading: loading.auth
    }),
    [authUser, token, isAuthenticated, login, register, logout, loading.auth]
  );
}