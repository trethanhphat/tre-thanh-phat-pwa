// app/layout.tsx
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
// test preview 3
