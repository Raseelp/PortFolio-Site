import { ImageResponse } from "next/og";
import { profile, heroCopy } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static social-share card — same dark navy + single accent-blue language
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
          background: "#0a0f16",
          color: "#e6ebf2",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 56,
            height: 6,
            borderRadius: 3,
            background: "#1fbcfd",
            marginBottom: 40,
          }}
        />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -1.5 }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: "#1fbcfd", marginTop: 8 }}>
          {profile.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 26,
            lineHeight: 1.5,
            color: "#93a2b8",
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
