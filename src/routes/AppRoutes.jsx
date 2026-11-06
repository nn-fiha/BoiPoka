import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import MobileNav from "../components/Header/MobileNav";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer/Footer";
import RequireAuth from "../components/RequireAuth";
import ErrorBoundary from "../components/Common/ErrorBoundary";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ShelfPage from "../pages/ShelfPage";
import StatsPage from "../pages/StatsPage";
import WrappedPage from "../pages/WrappedPage";
import ReaderPage from "../pages/ReaderPage";
import FreeReadingPage from "../pages/FreeReadingPage";
import SharedShelfPage from "../pages/SharedShelfPage";
import WelcomePage from "../pages/WelcomePage";
import LibraryPage from "../pages/LibraryPage";
import BookPage from "../pages/BookPage";
import AddBookPage from "../pages/AddBookPage";
import SettingsPage from "../pages/SettingsPage";

// Remounting on navigation clears a previous page's crash
const PageBoundary = ({ children }) => {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
};

const NotFound = () => (
  <div className="py-24 text-center">
    <p className="font-serif text-3xl font-bold">Page not found</p>
    <a href="/" className="mt-4 inline-block text-terra underline">Go home</a>
  </div>
);

// Sign-in screens fill the page edge to edge, so they skip the footer
const AUTH_PATHS = ["/login", "/reset-password", "/welcome"];

const PageFooter = () => {
  const { pathname } = useLocation();
  return AUTH_PATHS.includes(pathname) ? null : <Footer />;
};

// The book reader takes the whole screen, without the site header, footer or tab bar
const isReader = (pathname) => pathname.startsWith("/read/");

const Shell = ({ children }) => {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const reading = isReader(pathname);

  return (
    <div className={`min-h-screen flex flex-col ${profile && !reading ? "pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0" : ""}`}>
      {!reading && <Header />}
      {children}
      {!reading && <PageFooter />}
      {!reading && <MobileNav />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <Shell>
        {/* Pages fill the width exactly; without w-full a centred page would grow to fit its widest shelf */}
        <main className="flex flex-1 flex-col [&>*]:w-full [&>*]:min-w-0">
          <PageBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/free" element={<FreeReadingPage />} />
              <Route path="/u/:username" element={<ShelfPage />} />
              <Route path="/u/:username/stats" element={<StatsPage />} />
              <Route path="/u/:username/wrapped" element={<WrappedPage />} />
              <Route path="/s/:token" element={<SharedShelfPage />} />
              <Route path="/book/:id" element={<BookPage />} />
              <Route path="/read/:id" element={<ReaderPage />} />
              <Route path="/add" element={<RequireAuth><AddBookPage /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="/welcome" element={<RequireAuth><WelcomePage /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageBoundary>
        </main>
      </Shell>
    </Router>
  );
};

export default AppRoutes;
