import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'solid' | 'line';

interface Shared {
  variant?: Variant;
  size?: 'md' | 'lg';
  /** Adds the small pulsing dot used on volunteer calls to action. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

type Props =
  | (Shared & { to: string })
  | (Shared & { href: string; external?: boolean })
  | (Shared & { onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean });

/** Colours come from the surrounding theme: "solid" is foreground-on-background inverted, "line" is outlined. */
export function Button(props: Props) {
  const { variant = 'solid', size = 'md', dot = false, className = '', children } = props;
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
  const inner = (
    <>
      {dot && <span className="btn__dot" aria-hidden="true" />}
      <span>{children}</span>
    </>
  );

  if ('to' in props) return <Link to={props.to} className={cls}>{inner}</Link>;
  if ('href' in props) {
    return (
      <a href={props.href} className={cls} {...(props.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <button type={props.type ?? 'button'} className={cls} onClick={props.onClick} disabled={props.disabled}>
      {inner}
    </button>
  );
}
