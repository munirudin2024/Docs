import './Checkbox.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label
}) => {
  return (
    <label className="checkbox-wrapper">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox-input"
      />
      <span className="checkbox-label">{label}</span>
    </label>
  );
};
