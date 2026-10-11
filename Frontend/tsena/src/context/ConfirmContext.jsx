import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

/**
 * Remplace window.confirm par une boîte de dialogue au style du site.
 * Usage : const confirm = useConfirm(); if (!(await confirm('Supprimer ?', { danger: true }))) return;
 */
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const cancelRef = useRef(null);
  const previousFocus = useRef(null);

  const confirm = useCallback(
    (message, { title = 'Confirmer', confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger = false } = {}) =>
      new Promise((resolve) => {
        previousFocus.current = document.activeElement;
        setDialog({ message, title, confirmLabel, cancelLabel, danger, resolve });
      }),
    []
  );

  const close = useCallback(
    (result) => {
      dialog?.resolve(result);
      setDialog(null);
      previousFocus.current?.focus?.();
    },
    [dialog]
  );

  useEffect(() => {
    if (!dialog) return undefined;
    // Focus sur « Annuler » : le choix sans risque par défaut
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && close(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dialog, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-gray-950/50" onClick={() => close(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onClick={(e) => e.stopPropagation()}
            className="toast-enter w-full max-w-md bg-white border-t-4 border-gray-950 shadow-2xl p-6"
          >
            <div className="flex gap-4">
              {dialog.danger && (
                <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-red-50 text-red-700">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <h2 id="confirm-title" className="font-display text-lg font-bold text-gray-950">
                  {dialog.title}
                </h2>
                <p id="confirm-message" className="mt-1 text-gray-700">
                  {dialog.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => close(false)}
                className="h-11 px-5 border-2 border-gray-300 font-semibold text-gray-900 hover:border-gray-950 transition-colors cursor-pointer"
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`h-11 px-5 font-semibold text-white transition-colors cursor-pointer ${
                  dialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-950 hover:bg-emerald-700'
                }`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm doit être utilisé dans ConfirmProvider');
  return context;
}
