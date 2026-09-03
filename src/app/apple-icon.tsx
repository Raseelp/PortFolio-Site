import { ImageResponse } from "next/og";
import { TECH_ICON_PATHS } from "@/lib/techIcons";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const flutterPath = TECH_ICON_PATHS.flutter[0];

// Same Flutter mark as icon.tsx, scaled up for iOS home-screen bookmarks.
export default function AppleIcon() {
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
        }}
      >
        <svg width="104" height="104" viewBox="0 0 24 24" fill="#1fbcfd">
          <path d={flutterPath} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
