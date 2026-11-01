import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import SetupNeeded from "./components/SetupNeeded";
import { AuthProvider } from "./context/AuthContext";
import { ReadingProvider } from "./context/ReadingContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { isConfigured } from "./lib/supabase";

const ThemedToasts = () => {
  const { theme } = useTheme();
  return <ToastContainer position="bottom-right" autoClose={1800} theme={theme} />;
};

function App() {
  return (
    <ThemeProvider>
      {isConfigured ? (
        <AuthProvider>
          <ReadingProvider>
            <AppRoutes />
            <ThemedToasts />
          </ReadingProvider>
        </AuthProvider>
      ) : (
        <SetupNeeded />
      )}
    </ThemeProvider>
  );
}

export default App;
