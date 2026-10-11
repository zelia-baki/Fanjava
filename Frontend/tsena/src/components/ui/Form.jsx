import { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

/*
 * Briques de formulaire partagées : label toujours visible, erreur sous le champ
 * (reliée par aria-describedby), hauteur 48px pour le tactile et texte 16px
 * pour éviter le zoom automatique d'iOS.
 */

const champBase =
  'block w-full bg-white text-base text-gray-950 placeholder:text-gray-400 border transition-colors ' +
  'outline-none focus:border-gray-950 focus:ring-2 focus:ring-emerald-600/25 disabled:bg-gray-50';

const etatChamp = (error) =>
  error ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20' : 'border-gray-300 hover:border-gray-400';

function Field({ id, label, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900 mb-1.5">
        {label}
        {required ? (
          <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
        ) : (
          <span className="ml-1.5 font-normal text-gray-500">(optionnel)</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-gray-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function Input({ id, label, icon: Icon, error, hint, required, className = '', ...props }) {
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
        )}
        <input
          id={id}
          name={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${champBase} ${etatChamp(error)} h-12 ${Icon ? 'pl-11' : 'pl-3.5'} pr-3.5 ${className}`}
          {...props}
        />
      </div>
    </Field>
  );
}

export function PasswordInput({ id, label, icon: Icon, error, hint, required, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
        )}
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${champBase} ${etatChamp(error)} h-12 ${Icon ? 'pl-11' : 'pl-3.5'} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-500 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer"
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </Field>
  );
}

export function Textarea({ id, label, error, hint, required, rows = 3, ...props }) {
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${champBase} ${etatChamp(error)} px-3.5 py-3 resize-y min-h-24`}
        {...props}
      />
    </Field>
  );
}

export function FormAlert({ tone = 'error', title, children }) {
  const success = tone === 'success';
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`flex gap-3 border-l-4 p-4 text-sm ${
        success ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-red-600 bg-red-50 text-red-900'
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${success ? 'text-emerald-700' : 'text-red-700'}`} aria-hidden="true" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

export function SubmitButton({ loading, loadingText, icon: Icon, children, className = '' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading || undefined}
      className={`w-full h-12 px-5 flex items-center justify-center gap-2 bg-gray-950 text-white font-semibold tracking-wide transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
        </>
      )}
    </button>
  );
}

/** Titre de section numéroté pour les formulaires longs (inscription). */
export function FormSection({ step, title, description, children }) {
  return (
    <fieldset className="space-y-5">
      <legend className="w-full mb-5 pb-3 border-b-2 border-gray-950 flex items-baseline gap-3">
        <span className="font-display text-sm font-bold text-emerald-700">{step}</span>
        <span className="font-display text-lg font-bold text-gray-950">{title}</span>
      </legend>
      {description && <p className="-mt-2 text-sm text-gray-600">{description}</p>}
      {children}
    </fieldset>
  );
}
