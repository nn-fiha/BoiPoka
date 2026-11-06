import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navClass = ({ isActive }) => (isActive ? "text-[#f4c9a8]" : "hover:text-[#f4c9a8]");
// Icon links get a 40px tap area on phones without looking any bigger
const TAP = "inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center";

function Header() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-sage-dark text-cream dark:bg-[#1d2620] dark:border-b dark:border-line">
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
        <nav className="flex items-center gap-1 font-medium sm:gap-5">
          <button
            onClick={toggleTheme}
            className={`${TAP} hover:text-[#f4c9a8]`}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <i className={`bx ${theme === "dark" ? "bx-sun" : "bx-moon"} align-middle text-xl`}></i>
          </button>
          {/* On phones these links live in the bottom tab bar once signed in */}
          <NavLink
            to="/library"
            aria-label="Library"
            className={(state) => `${navClass(state)} ${TAP} ${profile ? "hidden sm:inline-flex" : ""}`}
          >
            <i className="bx bx-book-open align-middle text-xl"></i>
            <span className="hidden sm:inline ml-1">Library</span>
          </NavLink>
          <NavLink to="/free" aria-label="Read free" className={(state) => `${navClass(state)} ${TAP}`}>
            <i className="bx bx-book-reader align-middle text-xl"></i>
            <span className="hidden lg:inline ml-1">Read free</span>
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
              <button onClick={handleSignOut} className={`${TAP} hover:text-[#f4c9a8]`} aria-label="Sign out" title="Sign out">
                <i className="bx bx-log-out align-middle text-xl"></i>
              </button>
            </>
          ) : (
            <NavLink to="/login" aria-label="Sign in" className={(state) => `${navClass(state)} ${TAP} whitespace-nowrap`}>
              {/* Narrow phones show just the icon so the header still fits */}
              <span className="hidden min-[400px]:inline">Sign in </span>
              <i className="bx bx-log-in align-middle text-xl"></i>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
