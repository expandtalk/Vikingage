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
    rollupOptions: {
      output: {
        // Split heavy third-party libraries into cacheable vendor chunks
        // instead of one ~2 MB bundle. Order matters: more specific matches
        // (leaflet, radix, …) are checked before the generic react bucket.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-leaflet') || id.includes('/leaflet')) return 'vendor-map';
          if (id.includes('recharts') || id.includes('/d3-')) return 'vendor-charts';
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react';
          return 'vendor';
        },
      },
    },
  },
}));
