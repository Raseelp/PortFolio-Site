const DISPLACEMENT_MAP_SVG = `
  <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="red-grad" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#0000"/>
        <stop offset="100%" stop-color="red"/>
      </linearGradient>
      <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0000"/>
        <stop offset="100%" stop-color="blue"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="50" height="50" fill="black"/>
    <rect x="0" y="0" width="50" height="50" rx="24" fill="url(#red-grad)" />
    <rect x="0" y="0" width="50" height="50" rx="24" fill="url(#blue-grad)" style="mix-blend-mode: difference" />
    <rect x="1.75" y="1.75" width="46.5" height="46.5" rx="24" fill="hsl(0 0% 50% / 0.93)" style="filter: blur(11px)" />
  </svg>
`;

const MAP_HREF = `data:image/svg+xml,${encodeURIComponent(DISPLACEMENT_MAP_SVG)}`;

/**
 * The refractive "liquid glass" filter, per the reference site's nav
 * buttons: a per-RGB-channel chromatic displacement (via a rounded-rect
 * gradient map) plus a closing blur, referenced from CSS as
 * `backdrop-filter: url(#liquid-glass-filter)`. This exact SVG-filter
 * recipe (feImage map + per-channel feDisplacementMap + feBlend) is a
 * widely shared open technique for the "Liquid Glass" look, not something
 * unique to that site — reimplemented here rather than copied from it.
 * Mount once; every element can reference the same filter id.
 */
export function LiquidGlassFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="liquid-glass-filter" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
        <feImage x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" href={MAP_HREF} />
        <feDisplacementMap in="SourceGraphic" in2="map" result="dispRed" scale={-50} xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feDisplacementMap in="SourceGraphic" in2="map" result="dispGreen" scale={-44} xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feDisplacementMap in="SourceGraphic" in2="map" result="dispBlue" scale={-38} xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
        <feBlend in="red" in2="green" mode="screen" result="rg" />
        <feBlend in="rg" in2="blue" mode="screen" result="output" />
        <feGaussianBlur in="output" stdDeviation="3" />
      </filter>
    </svg>
  );
}
