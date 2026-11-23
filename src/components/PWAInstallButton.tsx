import { useState } from 'react';
import { Download, Share, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Instalar aplicación en el móvil"
        className="inline-flex items-center gap-1.5 min-h-[40px] rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] px-3 py-1.5 text-xs font-semibold text-white border border-white/25 transition-all whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Instalar</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Cómo instalar en iPhone o iPad"
          className="inline-flex items-center gap-1.5 min-h-[40px] rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] px-3 py-1.5 text-xs font-semibold text-white border border-white/25 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Share className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Instalar</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#231712]/55 backdrop-blur-xs p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-white border border-[#E6DEC3] p-6 shadow-earth-lg text-[#231712]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id="ios-install-title" className="text-lg font-extrabold text-[#A0522D]">
                  Instalar en iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar instrucciones de instalación"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#6E5849] hover:bg-[#F5F5DC] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-[#231712] list-decimal list-inside">
                <li>
                  Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </li>
                <li>
                  Desliza y selecciona <strong>Añadir a pantalla de inicio</strong>.
                </li>
                <li>
                  Pulsa <strong>Añadir</strong> para usarla sin conexión en las pistas.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-[#E35336] hover:bg-[#c9452a] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 right-3 z-50 inline-flex items-center gap-2 rounded-xl bg-[#A0522D] text-white px-3.5 py-2 text-xs font-semibold shadow-earth-lg border border-white/20"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#F4A460]" aria-hidden="true" />
      <span>Modo sin conexión · Datos locales activos</span>
    </div>
  );
}
