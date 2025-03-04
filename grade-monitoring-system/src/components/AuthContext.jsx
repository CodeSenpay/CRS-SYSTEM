import { createContext, useState } from "react";

export const authContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState();
  const [isMFAEnable, setIsMFAEnable] = useState();

  const login = (user) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  const setMFA = (data) => {
    setIsMFAEnable(data);
  };
  return (
    <authContext.Provider value={{ user, logout, login, setMFA }}>
      {children}
    </authContext.Provider>
  );
}
