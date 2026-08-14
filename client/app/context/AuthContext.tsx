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
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load saved authentication data
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem("auth_token");
            const savedUser = localStorage.getItem("auth_user");

            if (savedToken) {
                setToken(savedToken);
            }

            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to load authentication data:", error);

            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
        } finally {
            setLoading(false);
        }
    }, []);

    // Login
    const login = async (
        email: string,
        password: string
    )=> {
        try {
            const {data} = await api.post('/auth/login', {email, password})
            setUser(data.user);
            setToken(data.token)
            localStorage.setItem("auth_token", data.token)
            localStorage.setItem("auth_user", JSON.stringify(data.user))
            toast.success("Login successful")
            router.push('/')
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message)
        }
    };

    // Register
    const register = async (
        name: string,
        email: string,
        password: string
    ): Promise<void> => {
        try {
            setLoading(true);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            const { user: registeredUser, token: authToken } = data;

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
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = (): void => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    };

    // Update user information
    const updateUser = (userData: Partial<User>): void => {
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