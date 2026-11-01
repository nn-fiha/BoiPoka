import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navClass = ({ isActive }) => (isActive ? "text-yellow-400" : "hover:text-yellow-300");

function Header() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-wood-dark text-cream dark:bg-[#2a1b0f] dark:border-b dark:border-wood/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/images/boipoka.png"
            alt="BoiPoka logo"
            className="h-11 w-11 sm:h-14 sm:w-14 object-contain rounded-full bg-yellow-500"
          />
          <div>
            <div className="font-serif text-xl sm:text-2xl font-bold leading-none">BoiPoka</div>
            <div className="font-bangla text-xs sm:text-sm text-cream/70">আমার পড়ার জগৎ</div>
          </div>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 font-medium">
          <button
            onClick={toggleTheme}
            className="hover:text-yellow-300"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"} align-middle text-xl`}></i>
          </button>
          {/* On phones these links live in the bottom tab bar once signed in */}
          <NavLink to="/library" className={(state) => `${navClass(state)} ${profile ? "hidden sm:inline" : ""}`}>
            <i className="bx bx-book-open align-middle text-xl"></i>
            <span className="hidden sm:inline ml-1">Library</span>
          </NavLink>
          {profile ? (
            <>
              <NavLink to={`/u/${profile.username}`} className={(state) => `${navClass(state)} hidden sm:inline`}>
                <i className="bx bx-library align-middle text-xl mr-1"></i>My Shelf
              </NavLink>
              <NavLink to="/add" className={(state) => `${navClass(state)} hidden sm:inline`}>
                <i className="bx bx-plus align-middle text-xl"></i>
                <span className="ml-1">Add</span>
              </NavLink>
              <NavLink to="/settings" className={(state) => `${navClass(state)} hidden sm:inline`} aria-label="Settings">
                <i className="bx bx-cog align-middle text-xl"></i>
              </NavLink>
              <button onClick={handleSignOut} className="hover:text-yellow-300" aria-label="Sign out" title="Sign out">
                <i className="bx bx-log-out align-middle text-xl"></i>
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navClass}>
              Sign in <i className="bx bx-log-in align-middle text-xl"></i>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
