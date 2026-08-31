"use client";

import { LogOutIcon, TruckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DeliveryPartner } from "@/app/types";
import { useRouter } from "next/navigation";

interface DeliveryLayoutProps {
    children: React.ReactNode;
}

const page = ({ children }: DeliveryLayoutProps) => {
    const router = useRouter();

    const [partner, setPartner] = useState<DeliveryPartner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const saved = localStorage.getItem("delivery_partner");
    const token = localStorage.getItem("delivery_token");

    console.log("Saved partner:", saved);
    console.log("Token:", token);

    if (!saved || !token) {
        router.replace("/delivery/login");
        return;
    }

    try {
        const parsedPartner: DeliveryPartner = JSON.parse(saved);

        console.log("Parsed partner:", parsedPartner);

        setPartner(parsedPartner);
        setLoading(false);
    } catch (error) {
        console.error("Failed to parse delivery partner:", error);

        localStorage.removeItem("delivery_partner");
        localStorage.removeItem("delivery_token");

        router.replace("/delivery/login");
    }
}, [router]);

    const handleLogout = () => {
        localStorage.removeItem("delivery_partners");
        localStorage.removeItem("delivery_token");

        router.replace("/delivery/login");
    };


    if (!partner) {
        return null;
    }

    return (
        <div className="min-h-screen bg-app-cream">
            <header className="sticky top-0 z-40 bg-white border-b border-app-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <TruckIcon className="size-6 text-app-green" />

                        <span className="text-lg font-semibold text-app-green">
                            Instacart Delivery
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-600">
                            {partner.name}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOutIcon className="size-4" />
                        </button>
                    </div>

                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
};

export default page;

