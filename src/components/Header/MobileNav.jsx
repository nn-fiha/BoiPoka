import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const tabClass = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? "text-[#f4c9a8]" : "text-cream/80"}`;

// App-style tab bar for signed-in readers on phones
const MobileNav = () => {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-40 flex bg-sage-dark/95 backdrop-blur border-t border-black/20 dark:bg-[#1d2620]/95 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main"
    >
      {[
        [`/u/${profile.username}`, "bx-library", "My Shelf"],
        ["/library", "bx-book-open", "Library"],
        ["/add", "bx-plus-circle", "Add"],
        [`/u/${profile.username}/stats`, "bx-bar-chart-alt-2", "Stats"],
        ["/settings", "bx-cog", "Settings"],
      ].map(([to, icon, label]) => (
        <NavLink key={to} to={to} end className={tabClass}>
          <i className={`bx ${icon} text-2xl leading-none`}></i>
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
