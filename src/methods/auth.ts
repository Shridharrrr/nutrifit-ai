import {auth,db} from "../config/firebase"
import { onAuthStateChanged,signOut,User } from "firebase/auth"
import {getDoc,doc} from 'firebase/firestore'
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