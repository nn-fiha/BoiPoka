import React from "react";
import { Link } from "react-router-dom";

const COVERS = ["book1.jpeg", "book3.jpg", "book5.jpg", "book8.jpeg", "book12.jpg", "book14.png"];

// Split screen: a branded shelf panel on wide screens, the form on the right
const AuthLayout = ({ children }) => (
  <div className="flex-1 lg:grid lg:grid-cols-[1.05fr_1fr]">
    <aside className="display-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="display-spotlight pointer-events-none absolute inset-x-0 top-0 h-96" />
      <Link to="/" className="relative flex items-center gap-3 text-white">
        <img src="/images/boipoka.png" alt="" className="h-12 w-12 rounded-full bg-yellow-500 object-contain" />
        <span className="font-display text-2xl tracking-wide">BoiPoka</span>
      </Link>

      <div className="relative">
        <h2 className="max-w-lg font-display text-4xl leading-tight tracking-wide text-white xl:text-5xl">
          Every book you've read, on one shelf.
        </h2>
        <p className="mt-4 max-w-md font-bangla text-lg text-white/85">যত বই পড়েছি, সব এক তাকে।</p>

        {/* Same 3D shelf as the bookshelf pages: recessed back wall, books resting on a deep ledge */}
        <div className="relative mt-10">
          <div className="display-board absolute inset-x-4 bottom-9 top-0" />
          <div className="relative z-10 -mb-5 flex items-end justify-center gap-3 px-8 pb-2 pt-6 xl:gap-4">
            {COVERS.map((cover, i) => (
              // The sixth cover only fits on extra-wide screens
              <div key={cover} className={`relative ${i === 5 ? "hidden xl:block" : ""}`}>
                <span
                  aria-hidden="true"
                  className="book-contact-shadow pointer-events-none absolute -bottom-1.5 left-1 right-1 h-3"
                />
                <img
                  src={`/images/${cover}`}
                  alt=""
                  className="relative aspect-[2/3] w-[4.5rem] rounded-[3px] object-cover shadow-[4px_8px_14px_rgba(30,40,30,0.35)] xl:w-20"
                />
              </div>
            ))}
          </div>
          <div className="display-ledge-top relative h-5" />
          <div className="display-ledge-front relative h-4 rounded-b-[3px]" />
        </div>
      </div>

      <ul className="relative grid grid-cols-3 gap-4 text-sm text-white/90">
        {[
          ["bx-library", "Your own shelf"],
          ["bx-edit-alt", "A journal per book"],
          ["bx-bar-chart-alt-2", "Yearly goals & stats"],
        ].map(([icon, label]) => (
          <li key={label} className="flex items-center gap-2">
            <i className={`bx ${icon} text-xl`}></i>
            {label}
          </li>
        ))}
      </ul>
    </aside>

    <main className="flex items-start justify-center px-4 py-10 sm:items-center sm:py-16">
      <div className="w-full max-w-md">{children}</div>
    </main>
  </div>
);

export default AuthLayout;
