import styles from './atoms.module.css';

type ButtonVariant = 'primary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'ghost', size = 'md', className, ...props }: Props) {
  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  return <button className={`${styles.button} ${styles[variant]} ${sizeClass} ${className ?? ''}`.trim()} {...props} />;
}
