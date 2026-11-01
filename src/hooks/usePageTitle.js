import { useEffect } from "react";

const SITE = "BoiPoka";
export const SITE_URL = "https://boi-poka.vercel.app";
const DEFAULT_DESCRIPTION =
  "Put every book you've read on one shelf. Keep a reading journal with ratings, moods and quotes, set yearly reading goals, and share your bookshelf with friends.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

// Creates the <meta>/<link> tag if index.html doesn't already have it
const upsert = (selector, create, attribute, value) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

const absolute = (url) => (!url ? DEFAULT_IMAGE : url.startsWith("http") ? url : `${SITE_URL}${url}`);

// Title, description, canonical URL and social tags for the current page.
// Search engines that render JavaScript (Google, Bing) read these.
export const usePageMeta = ({ title, description, image, noindex = false } = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE}` : `${SITE} — your reading journal and bookshelf · আমার পড়ার জগৎ`;
    const text = description || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${window.location.pathname}`;

    document.title = fullTitle;
    const tags = [
      ["name", "description", text],
      ["name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"],
      ["property", "og:title", title || "BoiPoka — every book you've read, on one shelf"],
      ["property", "og:description", text],
      ["property", "og:url", url],
      ["property", "og:image", absolute(image)],
      ["name", "twitter:title", title || "BoiPoka — every book you've read, on one shelf"],
      ["name", "twitter:description", text],
      ["name", "twitter:image", absolute(image)],
    ];
    tags.forEach(([attribute, key, value]) => {
      let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    });
    upsert('link[rel="canonical"]', () => Object.assign(document.createElement("link"), { rel: "canonical" }), "href", url);
  }, [title, description, image, noindex]);
};

// Shorthand for pages that only need a title
export const usePageTitle = (title, options = {}) => usePageMeta({ title, ...options });
