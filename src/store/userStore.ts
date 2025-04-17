'use client'
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { persist } from "zustand/middleware"
import { UserData } from "@/models/userModel"

interface UserStore {
    user: UserData | null
    setUser: (data: UserData) => void
    clearUser: () => void
}

const userStore= create<UserStore>()(
    persist(
        immer((set) => ({
            user:null,
            setUser: (data) => set((state) => {
                state.user = data
            }),
            clearUser: () => set((state) => {
                state.user = null
            }),
        })),
        { name: 'user-storage'}
    )
)

export default userStore;