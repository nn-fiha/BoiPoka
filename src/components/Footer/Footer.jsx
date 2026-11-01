import React from "react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="p-4 text-center text-sm text-ink/60">
        © {new Date().getFullYear()} nn-fiha · every book here has passed through my hands
      </div>
    </footer>
  );
};

export default Footer;
