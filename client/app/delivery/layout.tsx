"use client";

import { LogOutIcon, TruckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DeliveryPartner } from "@/app/types";
import { dummyDeliveryPartnerData } from "@/assets/assets";
import { useRouter } from "next/navigation";

interface DeliveryLayoutProps {
    children: React.ReactNode;
}

const layout = ({children }: DeliveryLayoutProps) => {
    const router = useRouter();
    const [partner, setPartner] = useState<DeliveryPartner | null>(null);

    useEffect(() => {
        setPartner(dummyDeliveryPartnerData[0] as DeliveryPartner);
    }, []);

    const handleLogout = () => {
        router.replace("/delivery/login");
    };

    if (!partner) return null;

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
}

export default layout