import React from "react";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import SetupNeeded from "./components/SetupNeeded";
import { AuthProvider } from "./context/AuthContext";
import { ReadingProvider } from "./context/ReadingContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { isConfigured } from "./lib/supabase";

const ThemedToasts = () => {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2200}
      hideProgressBar
      closeOnClick
      pauseOnFocusLoss={false}
      draggable
      newestOnTop
      limit={3}
      transition={Slide}
      theme={theme}
      closeButton={false}
      icon={({ type }) => (
        <i
          className={`bx ${
            type === "error" ? "bx-error-circle text-red-500" : type === "success" ? "bx-check-circle text-sage" : "bx-info-circle text-terra"
          } text-xl`}
        ></i>
      )}
    />
  );
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
