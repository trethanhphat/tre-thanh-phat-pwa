// app/layout.tsx
import "@/src/fonts/ttp-font.css";
import "@/app/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: "sans-serif",
          background: "#fff",
          color: "#000",
          fontSize: "18px",
        }}
      >
        <main style={{ padding: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}
// Change to app
