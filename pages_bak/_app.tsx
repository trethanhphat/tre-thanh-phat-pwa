/* import "@/styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  // 🔁 Tự động kiểm tra và cập nhật Service Worker nếu có phiên bản mới
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.update(); // 👉 Gọi cập nhật SW mới
        });
      });

      // Tự reload khi SW mới sẵn sàng và đã activate
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, []);
  return <Component {...pageProps} />;
}

*/

import "@/styles/globals.css";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const { hasUpdate, update, connectionType } = useServiceWorkerUpdate();

  return (
    <>
      <Component {...pageProps} />
      {hasUpdate && (
        <button
          onClick={update}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#116530",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            zIndex: 9999,
          }}
        >
          🔄 Có bản cập nhật mới – Nhấn để làm mới
        </button>
      )}
    </>
  );
}
