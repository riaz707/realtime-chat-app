import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("chat_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("chat_token"));
  const [loading, setLoading] = useState(true);

  // On first load, verify the saved token is still good.
  useEffect(() => {
    const savedToken = localStorage.getItem("chat_token");
    if (!savedToken) {
      setLoading(false);
      return;
    }
    getMe()
      .then((me) => {
        setUser(me);
        localStorage.setItem("chat_user", JSON.stringify(me));
      })
      .catch(() => {
        localStorage.removeItem("chat_token");
        localStorage.removeItem("chat_user");
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    const { token: jwt, ...userFields } = data;
    localStorage.setItem("chat_token", jwt);
    localStorage.setItem("chat_user", JSON.stringify(userFields));
    setToken(jwt);
    setUser(userFields);
  };

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    persistSession(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    persistSession(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
