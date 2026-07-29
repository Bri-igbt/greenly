"use client";

import { TruckIcon, XIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Banner = () => {
    const [bannerVisible, setBannerVisible] = useState(true);

    useEffect(() => {
        const dismissed =
        sessionStorage.getItem("banner_dismissed") === "true";

        if (dismissed) {
        setBannerVisible(false);
        }
    }, []);

    const dismissedBanner = () => {
        setBannerVisible(false);
        sessionStorage.setItem("banner_dismissed", "true");
    };

    if (!bannerVisible) return null;

    return (
        <div>
            <div className="relative overflow-hidden bg-gradient-to-r from-app-green via-emerald-800 to-app-green text-xs text-white sm:text-sm">
                <div className="mx-auto flex-center max-w-7xl gap-6 px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex-center gap-2">
                        <TruckIcon className="size-4 shrink-0" />
                        <span>Free delivery on orders above $20</span>
                    </div>

                    <span className="hidden text-white/40 sm:inline">|</span>

                    <div className="hidden items-center gap-2 sm:flex">
                        <ZapIcon className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                        <span>Farm-fresh produce delivery daily</span>
                    </div>
                </div>

                <button
                    onClick={dismissedBanner}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/10"
                    aria-label="Dismiss banner"
                >
                    <XIcon className="size-3.5" />
                </button>
            </div>
        </div>
    );
};

export default Banner;