"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Banner from "@/app/components/Banner";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import CartSideBar from "@/app/components/CartSideBar";
import Loader from "@/app/components/Loader";
import { useAuth } from "@/app/context/AuthContext";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <Loader />;
    }

    return (
        <>
            <Banner />
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
            <CartSideBar />
        </>
    );
}