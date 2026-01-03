import { Input, Button, Checkbox } from '../../components';
import { useLoginForm } from '../../hooks/useLoginForm';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const {
    formData,
    showPassword,
    isLoading,
    error,
    successMessage,
    setShowPassword,
    handleInputChange,
    handleSubmit
  } = useLoginForm();

  return (
    <div className="login-container">
      <div className="login-illustration">
        <div className="illustration-content">
          <div className="device-mockup">
            <div className="phone">
              <div className="phone-screen">
                <div className="screen-element"></div>
                <div className="screen-element"></div>
                <div className="screen-element"></div>
              </div>
            </div>
            <div className="laptop laptop-1">
              <div className="laptop-screen"></div>
            </div>
            <div className="laptop laptop-2">
              <div className="laptop-screen"></div>
            </div>
          </div>
          <div className="person-illustration">
            <div className="person-head"></div>
            <div className="person-body"></div>
            <div className="person-legs"></div>
          </div>
        </div>
      </div>

      <div className="login-form-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">SISMAX</h1>
            <p className="login-subtitle">Sriboga Integrated System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <Input
              type="text"
              placeholder="Email"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              icon="user"
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              icon="password"
              showPasswordToggle
            />

            <Checkbox
              checked={showPassword}
              onChange={setShowPassword}
              label="Show Password"
            />

            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Signing In...' : 'SIGN IN'}
            </Button>
          </form>

          <footer className="login-footer">
            <p>Itech - DS © 2026 PT. Sriboga Flour Mill</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
