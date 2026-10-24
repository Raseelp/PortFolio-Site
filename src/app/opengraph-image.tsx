import { ImageResponse } from "next/og";
import { profile, heroCopy } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static social-share card — same ink + electric-blue language
// as the site itself, built from the real profile copy rather than a
// generic template graphic.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#f4f5fb",
          color: "#0f1030",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 56,
            height: 6,
            borderRadius: 3,
            background: "#2f5bff",
            marginBottom: 40,
          }}
        />
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -3, color: "#2336d9" }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800, letterSpacing: -2, color: "#0f1030", marginTop: 4 }}>
          {profile.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 26,
            lineHeight: 1.5,
            color: "#4f5275",
            maxWidth: 880,
          }}
        >
          {heroCopy.subtext}
        </div>
      </div>
    ),
    { ...size }
  );
}
