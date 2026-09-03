import { ImageResponse } from "next/og";
import { TECH_ICON_PATHS } from "@/lib/techIcons";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const flutterPath = TECH_ICON_PATHS.flutter[0];

// The real Flutter mark (same Simple Icons path used everywhere else on the
// site, via techIcons.ts) in the site's own accent blue on the same dark
// navy the rest of the UI uses — replaces the earlier "MR" text monogram.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070c12",
          borderRadius: 7,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1fbcfd">
          <path d={flutterPath} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
