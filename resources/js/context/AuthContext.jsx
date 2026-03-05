import { createContext, useState, useEffect } from "react";
import { apiRequest } from "../services/apiRequest";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginAdmin = async (email, password) => {
    const res = await apiRequest({
      method: "POST",
      url: "/login",
      data: { email, password },
    });

    localStorage.setItem("token", res.access_token);

    await fetchUser();
  };

  const loginSales = () => {
    window.location.href = "/api/auth/google";
  };

  const fetchUser = async () => {
    try {
      const data = await apiRequest({
        method: "GET",
        url: "/me",
      });
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAdmin,
        loginSales,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}