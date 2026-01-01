import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
  type UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase.config';
import type { AuthResponse } from '../types/auth.types';

/**
 * Login dengan email dan password
 */
export const loginWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    const token = await user.getIdToken();

    return {
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.uid,
        username: user.email || '',
        email: user.email || undefined
      }
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    let message = 'Terjadi kesalahan saat login';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Format email tidak valid';
        break;
      case 'auth/user-disabled':
        message = 'Akun telah dinonaktifkan';
        break;
      case 'auth/user-not-found':
        message = 'Email tidak terdaftar';
        break;
      case 'auth/wrong-password':
        message = 'Password salah';
        break;
      case 'auth/invalid-credential':
        message = 'Email atau password salah';
        break;
      case 'auth/too-many-requests':
        message = 'Terlalu banyak percobaan. Coba lagi nanti';
        break;
      default:
        message = error.message || 'Terjadi kesalahan saat login';
    }

    return {
      success: false,
      message
    };
  }
};

/**
 * Register user baru
 */
export const registerWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    const user = userCredential.user;
    const token = await user.getIdToken();

    return {
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: user.uid,
        username: user.email || '',
        email: user.email || undefined
      }
    };
  } catch (error: any) {
    console.error('Register error:', error);
    
    let message = 'Terjadi kesalahan saat registrasi';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Email sudah terdaftar';
        break;
      case 'auth/invalid-email':
        message = 'Format email tidak valid';
        break;
      case 'auth/weak-password':
        message = 'Password terlalu lemah (min. 6 karakter)';
        break;
      default:
        message = error.message || 'Terjadi kesalahan saat registrasi';
    }

    return {
      success: false,
      message
    };
  }
};

/**
 * Logout user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
