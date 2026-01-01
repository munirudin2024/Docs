import './Button.css';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  onClick,
  children,
  disabled = false,
  variant = 'primary',
  fullWidth = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`}
    >
      {children}
    </button>
  );
};
