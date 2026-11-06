import { forwardRef } from 'react';
import styles from './atoms.module.css';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={`${styles.input} ${className ?? ''}`.trim()} {...props} />;
});
