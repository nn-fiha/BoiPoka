import React from "react";
import { toast } from "react-toastify";

// Uses the phone's share sheet when available, otherwise copies the link
const ShareButton = ({ title, text, className = "" }) => {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // The reader closed the share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <button onClick={handleShare} className={className}>
      <i className="bx bx-share-alt align-middle"></i> Share
    </button>
  );
};

export default ShareButton;
