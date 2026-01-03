import { auth, googleProvider } from "../config/firebase";
import {
  signOut,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

export const LogoutUser = async () => {
  await signOut(auth);
};

export const SignupUser = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const SigninUser = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
};

export const GoogleSignupUser = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google signup error:', error);
    throw error;
  }
};
