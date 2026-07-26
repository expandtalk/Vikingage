import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5176,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Strip console/debugger from production builds only — keeps them in dev.
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : {},
  build: {
    // The app is already route-split via lazy() in App.tsx. The remaining large
    // chunks (index/Admin/RunicExplorerSimple) are inherently heavy — React core,
    // the admin panel, the map engine — and gzip to ~110–225 kB. Splitting them
    // further with manualChunks reintroduces the forwardRef ordering crash noted
    // below, so we raise the advisory limit instead of chasing the warning.
    chunkSizeWarningLimit: 800,
  },
  // NOTE: custom manualChunks removed. Splitting `react` into its own chunk
  // apart from the libraries that call `React.forwardRef` at module scope
  // (radix, lucide, react-leaflet, …) produced a production-only crash
  // ("Cannot read properties of undefined (reading 'forwardRef')") because the
  // dependent chunk could evaluate before the react chunk's exports were ready.
  // Vite's default chunking keeps the React dependency graph intact. Re-introduce
  // splitting later only with per-chunk runtime verification (vite preview).
}));
