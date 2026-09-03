import type Lenis from "lenis";
import type { MouseEvent } from "react";

// A module-level handle to the page's single Lenis instance, set by
// <SmoothScroll> on mount. Internal hash links route through it so
// in-page navigation gets the same momentum as scroll/wheel input,
// falling back to a plain scrollIntoView if Lenis hasn't mounted yet
// (or was skipped under prefers-reduced-motion).
let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function smoothScrollToHash(hash: string) {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const el = document.getElementById(id);
  if (!el) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: 0 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  history.pushState(null, "", `#${id}`);
}

/** Wire onto any internal `href="#id"` link's onClick. */
export function handleHashClick(e: MouseEvent, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  smoothScrollToHash(href);
}
