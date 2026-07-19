import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages (https://decoporange.github.io/vocab-quiz/) 用のbase。
// npm run dev ではローカル確認をしやすいよう "/" のままにする。
const BASE_PATH = "/vocab-quiz/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? BASE_PATH : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Vintage熟語クイズ",
        short_name: "Vintageクイズ",
        description: "Vintage 4th Edition 848〜1323 反復学習クイズ",
        lang: "ja",
        theme_color: "#6750A4",
        background_color: "#1C1B1F",
        display: "standalone",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
}));
