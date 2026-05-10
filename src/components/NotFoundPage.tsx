/** Friendly 404 page — used as the catch-all route. */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh-radial bg-white p-6">
      <div className="pointer-events-none absolute inset-0 bg-grid-light bg-grid-light opacity-40" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="mx-auto w-28 h-28 rounded-3xl bg-brand-gradient text-white grid place-items-center text-5xl font-extrabold shadow-glow-brand mb-6">
          404
        </div>
        <h1 className="text-3xl font-bold text-ink-900 font-display">Page not found</h1>
        <p className="text-ink-500 mt-2">
          The link is broken or the page has moved. Let's get you back on track.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white bg-brand-gradient shadow-glow-brand hover:opacity-90 transition"
          >
            <Home className="w-4 h-4" /> Take me home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
