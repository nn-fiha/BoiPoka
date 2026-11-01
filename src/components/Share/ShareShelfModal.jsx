import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "react-toastify";
import Modal from "../Common/Modal";
import VisibilityPicker, { visibilityChanges, visibilityOf } from "./VisibilityPicker";
import { useAuth } from "../../context/AuthContext";
import { shareUrl, updateProfile } from "../../lib/api";

const APPS = [
  {
    label: "WhatsApp",
    icon: "bxl-whatsapp",
    color: "bg-[#25D366]",
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    label: "Messenger",
    icon: "bxl-messenger",
    color: "bg-[#0084FF]",
    href: (url) => `fb-messenger://share/?link=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    icon: "bxl-facebook",
    color: "bg-[#1877F2]",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "Email",
    icon: "bx-envelope",
    color: "bg-ink/70",
    href: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
];

// The owner's share panel: who can see the shelf, the link, share targets and a QR code
const ShareShelfModal = ({ open, onClose }) => {
  const { profile, setProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const visibility = visibilityOf(profile);
  const url = profile?.share_token ? shareUrl(profile.share_token) : "";
  const text = `${profile?.display_name || profile?.username}'s bookshelf on BoiPoka`;
  const sharing = visibility !== "private";

  useEffect(() => {
    if (!open || !url) return;
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#2a2a26", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [open, url]);

  const save = async (changes, message) => {
    setBusy(true);
    try {
      setProfile(await updateProfile(profile.id, changes));
      if (message) toast.success(message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy — select the link and copy it");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: text, text, url });
    } catch {
      // The share sheet was dismissed
    }
  };

  const resetLink = async () => {
    setConfirmReset(false);
    await save({ share_token: crypto.randomUUID() }, "New link created — the old one no longer works");
  };

  if (!profile) return null;

  return (
    <Modal open={open} onClose={onClose} title="Share your shelf" size="max-w-lg">
      <h2 className="pr-10 font-serif text-2xl font-bold">Share your shelf</h2>
      <p className="mt-1 text-sm text-ink/60">Choose who can see it, then send friends your link.</p>

      <div className="mt-6">
        <VisibilityPicker
          value={visibility}
          disabled={busy}
          onChange={(key) => key !== visibility && save(visibilityChanges(key), "Shelf visibility updated")}
        />
      </div>

      {sharing && !profile.share_token ? (
        <p className="mt-6 rounded-2xl bg-terra/10 p-4 text-sm">
          Share links need a quick database update: run <code>supabase/migrations/005_share_links.sql</code> in Supabase.
        </p>
      ) : sharing ? (
        <div className="mt-6 space-y-5 motion-safe:animate-fade-in">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="share-link">
              Your shelf link
            </label>
            <div className="flex gap-2">
              <input
                id="share-link"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-terra/30"
              />
              <button
                onClick={copy}
                className="flex h-11 items-center gap-1.5 rounded-xl bg-terra px-4 text-sm font-medium text-cream hover:bg-terra-dark"
              >
                <i className="bx bx-copy"></i> Copy
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={nativeShare}
                className="flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm hover:bg-card"
              >
                <i className="bx bx-share-alt text-lg"></i> Share…
              </button>
            )}
            {APPS.map((app) => (
              <a
                key={app.label}
                href={app.href(url, text)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-1.5 pr-3.5 text-sm hover:bg-card"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${app.color}`}>
                  <i className={`bx ${app.icon} text-base`}></i>
                </span>
                {app.label}
              </a>
            ))}
          </div>

          {qr && (
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
              <img src={qr} alt="QR code for your shelf link" className="h-28 w-28 rounded-lg bg-white p-1" />
              <div className="text-sm">
                <p className="font-medium">Scan to open</p>
                <p className="mt-0.5 text-ink/60">Friends can point their phone camera here.</p>
                <a
                  href={qr}
                  download="boipoka-shelf-qr.png"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-terra hover:underline"
                >
                  <i className="bx bx-download"></i> Download QR
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
            <Link to={`/s/${profile.share_token}`} onClick={onClose} className="font-medium text-terra hover:underline">
              <i className="bx bx-show align-middle"></i> Preview as a friend
            </Link>
            {confirmReset ? (
              <span className="flex items-center gap-2">
                <span className="text-ink/70">Old links will stop working.</span>
                <button
                  onClick={resetLink}
                  disabled={busy}
                  className="font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  Reset
                </button>
                <button onClick={() => setConfirmReset(false)} className="text-ink/60 hover:underline">
                  Cancel
                </button>
              </span>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="text-ink/60 hover:text-ink">
                <i className="bx bx-refresh align-middle"></i> Reset link
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-ink/5 p-4 text-sm text-ink/70 motion-safe:animate-fade-in">
          <i className="bx bx-lock-alt mr-1 align-middle"></i>
          Your shelf is private. Choose <span className="font-medium">Public</span> or{" "}
          <span className="font-medium">Anyone with the link</span> to get a link you can share.
        </p>
      )}
    </Modal>
  );
};

export default ShareShelfModal;
