import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { TextArea } from '@/components/atoms/TextArea';
import styles from './molecules.module.css';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  multiline?: boolean;
};

export function DocumentInput({ id, label, value, onChange, onGenerate, multiline = false }: Props) {
  return (
    <div className={styles.stack}>
      <Label htmlFor={id}>{label}</Label>
      <div className={styles.inputRow}>
        {multiline ? (
          <TextArea
            id={id}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        ) : (
          <Input
            id={id}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        )}
        <Button type="button" variant="primary" onClick={onGenerate}>
          Generate
        </Button>
      </div>
    </div>
  );
}
