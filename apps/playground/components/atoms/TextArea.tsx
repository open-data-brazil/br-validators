import { forwardRef } from 'react';
import styles from './atoms.module.css';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(function TextArea(
  { className, ...props },
  ref,
) {
  return (
    <textarea ref={ref} className={`${styles.textarea} ${className ?? ''}`.trim()} {...props} />
  );
});
