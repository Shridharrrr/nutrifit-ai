import { setDoc, doc} from "firebase/firestore";
import { db } from "@/config/firebase";
import { UserData } from "@/models/userModel";

export async function saveUserData(user: UserData) {
    try {
      const userRef = doc(db, "users", user.uid); 
      await setDoc(userRef, user, { merge: true });
      console.log("User data saved successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  }