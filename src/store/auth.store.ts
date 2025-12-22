import { create } from "zustand";
import {
    signIn,
    signOut,
    getCurrentUser,
} from "aws-amplify/auth";

type AuthStore = {
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
    isLoggedIn: false,
    loading: true,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });

        try {
            const res = await signIn({
                username: email,
                password,
            });
            console.log(res);
            set({ isLoggedIn: true, loading: false });
        } catch (err: unknown) {
            let errorMessage = "Login failed";
            if (err instanceof Error) {
                errorMessage = err.message;
            }

            set({
                isLoggedIn: false,
                loading: false,
                error: errorMessage,
            });
            throw err;
        }
    },

    logout: async () => {
        set({ loading: true });

        try {
            await signOut();
        } finally {
            set({
                isLoggedIn: false,
                loading: false,
            });
        }
    },

    checkAuth: async () => {
        set({ loading: true });

        try {
            const res = await getCurrentUser();
            console.log(res);
            set({ isLoggedIn: true, loading: false });
        } catch {
            set({ isLoggedIn: false, loading: false });
        }
    },
}));
