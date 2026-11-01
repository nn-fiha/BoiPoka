import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "boipoka.theme";
const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // null means "follow the system setting"
  const [saved, setSaved] = useState(readSaved);
  const [systemDark, setSystemDark] = useState(systemQuery.matches);
  const theme = saved || (systemDark ? "dark" : "light");

  useEffect(() => {
    const onChange = (e) => setSystemDark(e.matches);
    systemQuery.addEventListener("change", onChange);
    return () => systemQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies for this visit
    }
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
