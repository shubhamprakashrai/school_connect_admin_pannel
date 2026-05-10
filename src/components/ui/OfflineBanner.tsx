/**
 * OfflineBanner — auto-watches `navigator.onLine`, slides in from the top
 * when connectivity drops, slides out when it returns.
 */

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        online ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm shadow-2xl">
        <WifiOff className="w-4 h-4" />
        <span className="font-medium">You're offline — changes won't sync until reconnected.</span>
      </div>
    </div>
  );
}
