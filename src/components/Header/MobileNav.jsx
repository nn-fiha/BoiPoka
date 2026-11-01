import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const tabClass = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? "text-yellow-400" : "text-cream/80"}`;

// App-style tab bar for signed-in readers on phones
const MobileNav = () => {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-40 flex bg-wood-dark/95 backdrop-blur border-t border-black/20 dark:bg-[#2a1b0f]/95 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      {[
        [`/u/${profile.username}`, "bx-library", "My Shelf"],
        ["/library", "bx-book-open", "Library"],
        ["/add", "bx-plus-circle", "Add"],
        ["/settings", "bx-cog", "Settings"],
      ].map(([to, icon, label]) => (
        <NavLink key={to} to={to} className={tabClass}>
          <i className={`bx ${icon} text-2xl leading-none`}></i>
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
