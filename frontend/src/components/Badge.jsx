import './Badge.css';

/**
 * Colored pill badge for displaying role names or permissions.
 * variant: 'indigo' | 'cyan' | 'emerald' | 'rose' | 'amber'
 */
export default function Badge({ text, variant = 'indigo' }) {
  return (
    <span className={`badge badge--${variant}`}>
      {text}
    </span>
  );
}
