import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where the real backend lives. The dev server proxies /api/* there so the
  // browser never sees a cross-origin request — bypasses CORS in development.
  // In production builds the env file's full URL is used directly.
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'https://api.schoolservice.in';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          // Strip the Origin header so the backend's CORS filter doesn't see
          // localhost as the requester. From the server's POV the request
          // looks like a server-to-server call.
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
          },
        },
      },
    },
  };
});
