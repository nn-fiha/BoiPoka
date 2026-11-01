// Vercel Routing Middleware: gives link-preview crawlers (Facebook, WhatsApp, X, Google…)
// real titles, descriptions and cover images for shelves and books. Those crawlers don't
// run JavaScript, so without this every shared link would show the same generic preview.
// Regular visitors skip all of this and get the normal single-page app.

export const config = {
  matcher: ["/book/:path*", "/u/:path*", "/s/:path*"],
};

const CRAWLERS =
  /bot|crawler|spider|facebookexternalhit|facebookcatalog|whatsapp|twitterbot|slackbot|linkedinbot|discordbot|telegrambot|pinterest|embedly|skypeuripreview|redditbot|applebot|googlebot|bingbot|duckduckbot|yandex/i;

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Replaces the content of an existing <meta> tag, or adds one before </head>
const setMeta = (html, attribute, key, value) => {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
};

// Long description tags span several lines in index.html, so normalise them first
const collapseMeta = (html) => html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, (tag) => tag.replace(/\s+/g, " "));

const applyMeta = (html, { title, description, image, url, noindex, card }) => {
  let out = collapseMeta(html).replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`);
  const tags = [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", url],
    ["property", "og:image", image],
    ["property", "og:image:alt", title],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", image],
  ];
  if (noindex) tags.push(["name", "robots", "noindex, nofollow"]);
  if (card) tags.push(["name", "twitter:card", card]);
  return tags.reduce((acc, [attribute, key, value]) => setMeta(acc, attribute, key, value), out);
};

const supabase = async (path, init) => {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  const response = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init?.headers },
  });
  return response.ok ? response.json() : null;
};

const absolute = (origin, url) => (!url ? `${origin}/og-image.png` : url.startsWith("http") ? url : `${origin}${url}`);
const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Works out the preview for a path, or null to leave the page as it is
export const previewFor = async (pathname, origin) => {
  const [, section, id] = pathname.split("/");
  if (!id) return null;
  const url = `${origin}${pathname}`;

  if (section === "book") {
    const [book] = (await supabase(`books?id=eq.${encodeURIComponent(id)}&select=title,author,genre,pages,cover_url`)) || [];
    if (!book) return null;
    const details = [book.genre, book.pages && `${book.pages} pages`].filter(Boolean).join(" · ");
    return {
      title: `${book.title} — ${book.author} · BoiPoka`,
      description: `${book.title} by ${book.author}${details ? ` (${details})` : ""}. Read reviews, moods and favourite quotes from BoiPoka readers.`,
      image: absolute(origin, book.cover_url),
      url,
      card: "summary",
    };
  }

  if (section === "u") {
    const [profile] =
      (await supabase(
        `profiles?username=eq.${encodeURIComponent(id.toLowerCase())}&select=username,display_name,bio,shelf_entries(status)`
      )) || [];
    if (!profile) return null;
    const name = profile.display_name || profile.username;
    const entries = profile.shelf_entries || [];
    const read = entries.filter((entry) => entry.status === "read").length;
    return {
      title: `${name}'s bookshelf · BoiPoka`,
      description: `${profile.bio ? `${profile.bio} — ` : ""}${plural(read, "book")} read on BoiPoka, with ratings, notes and favourite quotes.`,
      image: `${origin}/og-image.png`,
      url,
    };
  }

  if (section === "s") {
    const shelf = await supabase("rpc/shared_shelf", { method: "POST", body: JSON.stringify({ token: id }) });
    if (!shelf?.profile) return null;
    const name = shelf.profile.display_name || shelf.profile.username;
    const read = shelf.entries.filter((entry) => entry.status === "read").length;
    return {
      title: `${name} shared their bookshelf with you`,
      description: `${plural(read, "book")} read, with ratings, notes and favourite quotes. Open ${name}'s shelf on BoiPoka.`,
      image: `${origin}/og-image.png`,
      url,
      // Shared links are private to friends; don't let search engines list them
      noindex: true,
    };
  }

  return null;
};

export default async function middleware(request) {
  if (!CRAWLERS.test(request.headers.get("user-agent") || "")) return undefined;

  try {
    const { pathname, origin } = new URL(request.url);
    const preview = await previewFor(pathname, origin);
    if (!preview) return undefined;

    const page = await fetch(new URL("/index.html", request.url));
    if (!page.ok) return undefined;
    const html = applyMeta(await page.text(), preview);

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch {
    // Never let a preview problem break the page; fall back to the normal app
    return undefined;
  }
}

export { applyMeta };
