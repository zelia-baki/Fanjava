import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const DUREE_MS = 3500;

/**
 * Petites notifications non bloquantes (remplacent alert()).
 * Usage : const toast = useToast(); toast.success('Ajouté !', { action: { label: 'Voir', to: '/cart' } });
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message, options = {}) => {
      const id = ++nextId.current;
      // 3 toasts max à l'écran : on retire les plus anciens
      setToasts((prev) => [...prev.slice(-2), { id, type, message, action: options.action }]);
      setTimeout(() => dismiss(id), options.duration ?? DUREE_MS);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 sm:w-96 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-enter pointer-events-auto flex items-center gap-3 bg-gray-900 text-white rounded-xl shadow-lg px-4 py-3 text-sm"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="flex-1 min-w-0">{toast.message}</span>
            {toast.action && (
              <Link
                to={toast.action.to}
                onClick={() => dismiss(toast.id)}
                className="font-semibold text-orange-300 hover:text-orange-200 whitespace-nowrap"
              >
                {toast.action.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-white"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return context;
}
