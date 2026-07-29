"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
    PlusIcon,
    PackageSearchIcon,
    ShoppingBagIcon,
    LogOutIcon,
    BarChart3Icon,
    ShieldIcon,
    Truck,
} from "lucide-react";

import Navbar from "@/app/components/Navbar";

const adminLinks = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: BarChart3Icon,
    },
    {
        href: "/admin/products/new",
        label: "Add Product",
        icon: PlusIcon,
    },
    {
        href: "/admin/products",
        label: "Products",
        icon: PackageSearchIcon,
    },
    {
        href: "/admin/orders",
        label: "Orders",
        icon: ShoppingBagIcon,
    },
    {
        href: "/admin/delivery-partners",
        label: "Delivery Partners",
        icon: Truck,
    },
];

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        router.replace("/");
    };

    return (
        <div className="min-h-screen bg-app-cream">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-app-border">
                <Navbar />
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <div className="flex gap-8">
                    <aside
                        className="hidden lg:block fixed top-24 w-64 bg-white rounded-2xl border border-app-border p-4 h-fit">
                        <div className="pb-4 mb-4 border-b border-app-border">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-app-green">
                                <ShieldIcon className="size-5" />
                                Admin Panel
                            </h2>
                        </div>

                        <nav className="space-y-2">
                            {adminLinks.map((link) => {
                                const Icon = link.icon;

                                let isActive = false;

                                if (link.href === "/admin") {
                                    isActive = pathname === "/admin";
                                } else if (link.href === "/admin/products/new") {
                                    isActive = pathname === "/admin/products/new";
                                } else if (link.href === "/admin/products") {
                                    isActive =
                                        pathname === "/admin/products" ||
                                        (pathname.startsWith("/admin/products/") &&
                                            pathname !== "/admin/products/new");
                                } else {
                                    isActive =
                                        pathname === link.href ||
                                        pathname.startsWith(link.href + "/");
                                }

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-app-green text-white"
                                                : "text-app-text-light hover:bg-orange-50 hover:text-zinc-900"
                                        }`}
                                    >
                                        <Icon className="size-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-app-text-light hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                                <LogOutIcon className="size-4" />
                                Exit
                            </button>
                        </nav>
                    </aside>

                    <main className="flex-1 lg:ml-72 overflow-y-auto pb-20 no-scrollbar ">
                        {children}
                    </main>

                </div>
            </div>
        </div>
    );
}