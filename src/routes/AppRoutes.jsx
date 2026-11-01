import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "../components/Header/Header";
import MobileNav from "../components/Header/MobileNav";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer/Footer";
import RequireAuth from "../components/RequireAuth";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ShelfPage from "../pages/ShelfPage";
import LibraryPage from "../pages/LibraryPage";
import BookPage from "../pages/BookPage";
import AddBookPage from "../pages/AddBookPage";
import SettingsPage from "../pages/SettingsPage";

const AppRoutes = () => {
  const { profile } = useAuth();

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${profile ? "pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0" : ""}`}>
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/u/:username" element={<ShelfPage />} />
            <Route path="/book/:id" element={<BookPage />} />
            <Route path="/add" element={<RequireAuth><AddBookPage /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
            <Route path="*" element={<p className="py-24 text-center text-ink/60">Page not found.</p>} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </Router>
  );
};

export default AppRoutes;
