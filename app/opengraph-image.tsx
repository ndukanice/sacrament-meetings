import { ImageResponse } from "next/og";

// The preview picture shown when a link to the site is shared (Facebook,
// WhatsApp, LinkedIn, X). Next.js turns this into /opengraph-image and adds
// the og:image tags to every page automatically.
export const alt = "Sacrament Meetings · Isolo Ward, Lagos-Ikotun Stake of Zion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: "#cbd5e1" }}>
          WARD LEADERSHIP
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.1 }}>
            Sacrament Meetings
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 36, color: "#e2e8f0" }}>
            Plan, review, and print meeting programs
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderTop: "2px solid #475569",
            paddingTop: 28,
            fontSize: 30,
            color: "#cbd5e1",
          }}
        >
          Isolo Ward · Lagos-Ikotun Stake of Zion
        </div>
      </div>
    ),
    size,
  );
}
