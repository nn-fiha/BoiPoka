// Loads public-domain books from Bangla Wikisource and Project Gutenberg as chapters of clean HTML.
// A book's free_read column says where it lives: "wikisource:<page title>" or "gutenberg:<id>".

const WIKISOURCE = "https://bn.wikisource.org/w/api.php";

export const parseFreeRead = (value) => {
  if (!value) return null;
  const [type, ...rest] = value.split(":");
  const id = rest.join(":");
  if (type === "wikisource") return { type, id, credit: "Bangla Wikisource", url: `https://bn.wikisource.org/wiki/${encodeURIComponent(id)}` };
  if (type === "gutenberg") return { type, id, credit: "Project Gutenberg", url: `https://www.gutenberg.org/ebooks/${id}` };
  return null;
};

// Only plain text formatting survives: no links, images, scripts, styles or attributes,
// so nothing from another site can run or break the page
const ALLOWED = new Set(["P", "BR", "H2", "H3", "H4", "EM", "I", "STRONG", "B", "BLOCKQUOTE", "UL", "OL", "LI", "HR", "SUP", "SUB", "SMALL", "PRE"]);
const HEADINGS = { H1: "H2", H5: "H4", H6: "H4" };
const BLOCKS = new Set(["DIV", "CENTER", "SECTION", "TABLE", "TR", "TD", "TH", "TBODY", "DL", "DD", "DT", "POEM"]);

const clean = (root) => {
  const output = document.createElement("div");
  // `centred` is true inside a centring block, so the paragraphs in it stay centred.
  // The "center" class is ours; nothing is copied from the source page.
  const walk = (node, parent, centred = false) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        parent.appendChild(document.createTextNode(child.textContent));
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const tag = HEADINGS[child.tagName] || child.tagName;
      const centring = centred || tag === "CENTER" || /center/i.test(child.className);
      if (ALLOWED.has(tag)) {
        const copy = document.createElement(tag);
        if (centring && tag === "P") copy.className = "center";
        parent.appendChild(copy);
        walk(child, copy, centring);
      } else if (BLOCKS.has(tag)) {
        // Layout wrappers become paragraphs when they hold text directly, otherwise they're unwrapped
        const holdsText = [...child.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        const copy = holdsText ? document.createElement("p") : parent;
        if (holdsText) {
          if (centring) copy.className = "center";
          parent.appendChild(copy);
        }
        walk(child, copy, centring);
      } else if (!["SCRIPT", "STYLE", "IMG", "FIGURE", "SVG", "NOSCRIPT", "IFRAME", "OBJECT", "LINK"].includes(tag)) {
        walk(child, parent, centring);
      }
    });
  };
  walk(root, output);
  // Drop paragraphs left empty by removed images and navigation, and runs of line breaks
  output.querySelectorAll("p").forEach((p) => !p.textContent.trim() && p.remove());
  output.querySelectorAll("br + br").forEach((br) => br.remove());
  output.querySelectorAll("p > br:first-child, p > br:last-child").forEach((br) => br.remove());
  return output.innerHTML;
};

const wiki = async (page) => {
  const params = new URLSearchParams({ action: "parse", page, prop: "text", redirects: "1", format: "json", formatversion: "2", origin: "*" });
  const response = await fetch(`${WIKISOURCE}?${params}`);
  if (!response.ok) throw new Error("Couldn't reach Wikisource. Try again in a moment.");
  const data = await response.json();
  if (data.error) throw new Error("This book isn't on Wikisource any more.");
  return new DOMParser().parseFromString(data.parse.text, "text/html");
};

// Removes Wikisource's own header, navigation boxes and page numbers
const wikiText = (doc) => {
  doc.querySelectorAll(".ws-noexport, .headertemplate, #headertemplate, .footertemplate, .pagenum, .ws-pagenum, .mw-editsection, sup.reference, .reflist, .wst-dhr")
    .forEach((el) => el.remove());
  return clean(doc.querySelector(".mw-parser-output") || doc.body);
};

const loadWikisource = async (work) => {
  const doc = await wiki(work);
  const seen = new Set();
  const chapters = [...doc.querySelectorAll("a[title]")]
    .map((a) => a.getAttribute("title"))
    .filter((title) => title.startsWith(`${work}/`) && !seen.has(title) && seen.add(title))
    .map((title) => ({
      label: title.slice(work.length + 1).replace(/\//g, " · "),
      load: async () => wikiText(await wiki(title)),
    }));
  if (chapters.length) return chapters;
  // A short book kept on a single page
  const html = wikiText(doc);
  return [{ label: work, load: async () => html }];
};

// "He rode a black horse. CHAPTER III." → "Chapter III"; page markers like "{ix}" are dropped
const chapterLabel = (text) => {
  const plain = text.replace(/\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
  const named = plain.match(/\b(chapter|book|part|letter|volume|act|scene|canto|stave)\b[^.]*\.?.*$/i)?.[0] || plain;
  const label = named.replace(/\.$/, "").replace(/\.(?=[A-Za-z])/g, ". ").slice(0, 80);
  if (label !== label.toUpperCase()) return label;
  // ALL-CAPS headings become Title Case, keeping Roman numerals ("II.") upper case
  return label
    .toLowerCase()
    .replace(/(^|[\s.(-])([a-z])/g, (_, before, letter) => before + letter.toUpperCase())
    .replace(/\b([ivxlc]+)(?=\.|$)/gi, (numeral) => numeral.toUpperCase());
};

const loadGutenberg = async (id) => {
  const response = await fetch(`/gutenberg/cache/epub/${id}/pg${id}-images.html`);
  if (!response.ok) throw new Error("Couldn't reach Project Gutenberg. Try again in a moment.");
  const doc = new DOMParser().parseFromString(await response.text(), "text/html");
  // Gutenberg's licence header and footer, and the table of contents (we build our own)
  doc.querySelectorAll("#pg-header, #pg-footer, section.pg-boilerplate, .pg-boilerplate, .toc, .pagenum, script, style").forEach((el) => el.remove());

  // Split into chapters at the most common heading level that appears more than twice
  const level = ["h2", "h3", "h4"].find((tag) => doc.body.querySelectorAll(tag).length > 2);
  if (!level) {
    const html = clean(doc.body);
    return [{ label: "Full text", load: async () => html }];
  }
  const chapters = [];
  let current = { label: "Opening", nodes: [] };
  // Walk the flattened document so headings nested in chapter wrappers still split correctly
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const blocks = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const tag = node.tagName.toLowerCase();
    if (tag === level || (["p", "blockquote", "pre", "ul", "ol", "table", "h3", "h4", "h5"].includes(tag) && !node.parentElement.closest("p, blockquote, pre, ul, ol, table, h2, h3, h4, h5"))) {
      blocks.push(node);
    }
  }
  blocks.forEach((node) => {
    if (node.tagName.toLowerCase() === level) {
      if (current.nodes.length) chapters.push(current);
      current = { label: chapterLabel(node.textContent) || "Introduction", nodes: [node] };
    } else {
      current.nodes.push(node);
    }
  });
  if (current.nodes.length) chapters.push(current);

  const list = chapters
    .filter((chapter) => chapter.nodes.some((n) => n.textContent.trim()))
    .map(({ label, nodes }) => {
      const wrapper = document.createElement("div");
      nodes.forEach((n) => wrapper.appendChild(n.cloneNode(true)));
      const html = clean(wrapper);
      return { label, load: async () => html };
    });
  // New readers open at the story, not the title page and list of illustrations
  list.start = Math.max(0, list.findIndex(({ label }) => /^(chapter|letter|book|part|stave|canto|act|volume)\b|^(I|1)\.(\s|$)/i.test(label)));
  return list;
};

export const loadFreeBook = (source) => (source.type === "wikisource" ? loadWikisource(source.id) : loadGutenberg(source.id));

// Where a reader stopped, kept on this device
const progressKey = (bookId) => `boipoka.reading.${bookId}`;

export const readProgress = (bookId) => {
  try {
    return JSON.parse(localStorage.getItem(progressKey(bookId))) || null;
  } catch {
    return null;
  }
};

export const saveProgress = (bookId, progress) => {
  try {
    localStorage.setItem(progressKey(bookId), JSON.stringify(progress));
  } catch {
    // Without storage the reader starts from the beginning next time
  }
};
