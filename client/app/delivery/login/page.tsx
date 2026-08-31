
"use client";

import { useEffect, useState } from "react";
import { BikeIcon } from "lucide-react";
import { heroSectionData } from "@/assets/assets";
import Image from "next/image";
import api from "@/config/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);

        try {
            const { data } = await api.post(
                "/delivery/login",
                {
                    email,
                    password,
                }
            );

            // Save authentication data
            localStorage.setItem(
                "delivery_token",
                data.token
            );

            localStorage.setItem(
                "delivery_partner",
                JSON.stringify(data.partner)
            );

            toast.success("Login successful");

            router.push("/delivery");

        } catch (error: any) {
            console.error("Delivery login error:", error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("delivery_token");

        if (token) {
            router.replace("/delivery");
        }
    }, [router]);

    return (
        <div className="min-h-screen flex">

            {/* Left side */}
            <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">

                <Image
                    src={heroSectionData.hero_image}
                    alt=""
                    fill
                    className="object-cover opacity-10"
                />

                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-semibold text-white mb-4">
                        Delivery Partner Portal
                    </h2>

                    <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">
                        Manage your deliveries and keep customers happy.
                    </p>
                </div>
            </div>

            {/* Login side */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 bg-app-cream">

                <div className="w-full max-w-md">

                    <div className="text-center mb-8">

                        <div className="flex items-center justify-center gap-2 mb-4">

                            <BikeIcon className="size-7 text-app-green" />

                            <span className="text-2xl font-semibold text-app-green">
                                Greenly
                            </span>

                        </div>

                        <h1 className="text-2xl font-semibold text-app-green mb-2">
                            Delivery Partner Login
                        </h1>

                        <p className="text-sm text-app-text-light">
                            Sign in to manage your deliveries
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl p-8 space-y-5"
                    >

                        <div>

                            <label className="block text-sm font-medium text-app-green mb-1.5">
                                Email
                            </label>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border focus:border-app-green focus:outline-none text-sm transition-colors"
                                placeholder="partner@example.com"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-app-green mb-1.5">
                                Password
                            </label>

                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full px-4 py-2.5 rounded-xl border focus:border-app-green focus:outline-none text-sm transition-colors"
                                placeholder="••••••••"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default Page;

