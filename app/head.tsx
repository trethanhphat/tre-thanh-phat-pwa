// app/head.tsx
import { appName, appDescription, phone, email, copyright } from "@/libs/env";
export default function Head() {
  return (
    <>
      <title>{appName}</title>
      <meta name="description" content={appDescription} />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/icons/icon-192.png" />
      <meta name="theme-color" content="#000000" />
    </>
  );
}
