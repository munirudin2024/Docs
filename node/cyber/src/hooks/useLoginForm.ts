import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData } from '../types/auth.types';
import { loginWithEmail } from '../utils/auth.utils';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Validasi sederhana
      if (!formData.username || !formData.password) {
        setError('Email dan password harus diisi');
        setIsLoading(false);
        return;
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.username)) {
        setError('Format email tidak valid');
        setIsLoading(false);
        return;
      }

      // Login dengan Firebase
      const result = await loginWithEmail(formData.username, formData.password);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Login berhasil!');
        console.log('User logged in:', result.user);
        
        // Simpan token jika diperlukan
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        // Redirect ke dashboard setelah 500ms
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(result.message || 'Login gagal');
      }
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '' });
    setShowPassword(false);
    setError(null);
    setSuccessMessage(null);
  };

  return {
    formData,
    showPassword,
    isLoading,
    error,
    successMessage,
    setShowPassword,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
