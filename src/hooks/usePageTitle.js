import { useEffect } from "react";

const SITE = "BoiPoka";

// Sets the browser tab title for the current page
export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} · আমার পড়ার জগৎ`;
  }, [title]);
};
