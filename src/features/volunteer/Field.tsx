import type { ReactNode } from 'react';

export interface AriaProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  optional?: boolean;
  error?: string;
  children: (aria: AriaProps) => ReactNode;
}

/** Label + hint + inline error wrapped around any single input. */
export function Field({ id, label, hint, optional, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {hint && <p className="field__hint" id={hintId}>{hint}</p>}
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error && (
        <p className="field__error" id={errId}>
          <span aria-hidden="true" className="field__error-icon">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

interface ChoiceProps {
  /** Used for the radio group name and element ids. */
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  /** Options that cannot be chosen, with the reason shown to everyone. */
  disabled?: string[];
  disabledNote?: string;
}

/** Radio group drawn as pill buttons. Uses real radio inputs, so keyboard and screen readers work natively. */
export function ChoiceGroup({ name, legend, hint, options, value, onChange, onBlur, error, disabled = [], disabledNote }: ChoiceProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={`field choice ${error ? 'field--error' : ''}`} aria-describedby={describedBy}>
      <legend className="field__label">{legend}</legend>
      {hint && <p className="field__hint" id={hintId}>{hint}</p>}
      <div className="choice__options">
        {options.map((opt, i) => {
          const id = `${name}-${i}`;
          const isDisabled = disabled.includes(opt);
          return (
            <span className="choice__item" key={opt}>
              <input
                type="radio"
                id={id}
                name={name}
                value={opt}
                checked={value === opt}
                disabled={isDisabled}
                aria-invalid={Boolean(error)}
                onChange={() => onChange(opt)}
                onBlur={onBlur}
              />
              <label htmlFor={id}>{opt}</label>
            </span>
          );
        })}
      </div>
      {disabled.length > 0 && disabledNote && <p className="field__hint">{disabledNote}</p>}
      {error && (
        <p className="field__error" id={errId}>
          <span aria-hidden="true" className="field__error-icon">!</span>
          {error}
        </p>
      )}
    </fieldset>
  );
}
