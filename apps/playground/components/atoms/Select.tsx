import styles from './atoms.module.css';
import { ChevronDownIcon } from './icons';

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select(props: Props) {
  return (
    <div className={styles.selectWrap}>
      <select className={styles.select} {...props} />
      <ChevronDownIcon className={styles.selectChevron} />
    </div>
  );
}
