"use client";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from "../types";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import toast from "react-hot-toast";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;

    login: (
        email: string,
        password: string
    ) => Promise<void>;

    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<void>;

    logout: () => void;

    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken =
                localStorage.getItem("auth_token");

            const savedUser =
                localStorage.getItem("auth_user");

            if (savedToken) {
                setToken(savedToken);
            }

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error(
                "Failed to load authentication data:",
                error
            );

            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");

            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (
        email: string,
        password: string
    ): Promise<void> => {
        try {
            setLoading(true);

            const { data } = await api.post(
                "/auth/login",
                {
                    email,
                    password,
                }
            );

            const authUser = data.user;
            const authToken = data.token;

            if (!authUser || !authToken) {
                throw new Error(
                    "Invalid login response from server"
                );
            }

            setUser(authUser);
            setToken(authToken);

            localStorage.setItem(
                "auth_token",
                authToken
            );

            localStorage.setItem(
                "auth_user",
                JSON.stringify(authUser)
            );

            toast.success("Login successful");

            router.replace("/");
        } catch (error: any) {
            console.error("Login error:", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Login failed";

            toast.error(message);

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string
    ): Promise<void> => {
        try {
            setLoading(true);

            const { data } = await api.post(
                "/auth/register",
                {
                    name,
                    email,
                    password,
                }
            );

            const registeredUser = data.user;
            const authToken = data.token;

            if (!registeredUser || !authToken) {
                throw new Error(
                    "Invalid registration response from server"
                );
            }

            setUser(registeredUser);
            setToken(authToken);

            localStorage.setItem(
                "auth_token",
                authToken
            );

            localStorage.setItem(
                "auth_user",
                JSON.stringify(registeredUser)
            );

            toast.success(
                "Account created successfully"
            );

            router.replace("/");
        } catch (error: any) {
            console.error(
                "Registration error:",
                error
            );

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Registration failed";

            toast.error(message);

            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = (): void => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");

        toast.success("Logged out successfully");

        router.replace("/login");
    };

    const updateUser = (
        userData: Partial<User>
    ): void => {
        setUser((currentUser) => {
            if (!currentUser) {
                return null;
            }

            const updatedUser = {
                ...currentUser,
                ...userData,
            };

            localStorage.setItem(
                "auth_user",
                JSON.stringify(updatedUser)
            );

            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
}