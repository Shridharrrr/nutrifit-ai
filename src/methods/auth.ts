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
  await createUserWithEmailAndPassword(auth, email, password);
};

export const SigninUser = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const GoogleSignupUser = async () => {
  await signInWithPopup(auth, googleProvider);
};
