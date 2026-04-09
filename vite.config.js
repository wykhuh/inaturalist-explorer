import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        service_worker: "service_worker.js",
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === "service_worker"
            ? "[name].js" // put service worker in root
            : "assets/[name]-[hash].js"; // others in `assets/`
        },
      },
    },
  },
});
