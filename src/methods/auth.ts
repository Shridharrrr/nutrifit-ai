import { auth, db, googleProvider } from "../config/firebase"
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth"
import { getDoc, doc } from 'firebase/firestore'
import userStore from "@/store/userStore"

export const listenToAuthChanges = () => {
    onAuthStateChanged(auth, async(user:User | null) => {
        if (user) {
            const docRef = doc(db,'users',user.uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()){
                userStore.getState().setUser({
                    uid: user.uid,
                    ...docSnap.data()
                })
            }
        } else {
            userStore.getState().clearUser()
        }
    })
}

export const LogoutUser = async () => {
    await signOut(auth)
    userStore.getState().clearUser()
}

export const SignupUser = async ( email:string, password:string ) => {
      await createUserWithEmailAndPassword(auth, email, password);
  };

export const SigninUser = async ( email:string, password:string ) => {
      await signInWithEmailAndPassword(auth, email, password);
};  

export const GoogleSignupUser = async () => {
      await signInWithPopup(auth, googleProvider);
  };