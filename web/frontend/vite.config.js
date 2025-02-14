import { defineConfig, loadEnv } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || env.SHOPIFY_API_KEY || '';

  if (command === "build" && !process.env.CI && !SHOPIFY_API_KEY) {
    console.warn(
      "\nRunning build without SHOPIFY_API_KEY. The frontend will not work properly.\n"
    );
  }

  return {
    root: dirname(fileURLToPath(import.meta.url)),
    plugins: [react()],
    define: {
      "process.env.SHOPIFY_API_KEY": JSON.stringify(SHOPIFY_API_KEY),
      "process.env.VITE_SHOPIFY_API_KEY": JSON.stringify(SHOPIFY_API_KEY)
    },
    build: {
      outDir: "dist"
    },
    resolve: {
      preserveSymlinks: true,
    },
    server: {
      host: "localhost",
      port: process.env.FRONTEND_PORT,
      hmr: hmrConfig,
      proxy: {
        "^/(\\?.*)?$": proxyOptions,
        "^/api(/|(\\?.*)?$)": proxyOptions,
      },
    },
  };
});
