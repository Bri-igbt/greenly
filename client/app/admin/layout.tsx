"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        href: "/admin/dashboard",
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
    {
        href: "/",
        label: "Exit",
        icon: LogOutIcon,
    },
];

const layout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const pathname = usePathname();

    return (
        <div className="min-h-screen overflow-hidden bg-app-cream">

            <div className="hidden lg:block">
                <Navbar />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl p-4 border border-app-border h-fit">
                  <div className="pb-4 mb-4 border-b border-app-border">
                      <h2 className="text-lg font-semibold text-app-green flex items-center gap-2 px-2">
                          <ShieldIcon className="size-5" />
                          Admin Panel
                      </h2>
                  </div>

                 <nav className="flex flex-col gap-1.5">
    {adminLinks.map((link) => {
        const Icon = link.icon;

        let isActive = false;

        switch (link.href) {
            case "/admin/dashboard":
                isActive = pathname === "/admin/dashboard";
                break;

            case "/admin/products/new":
                isActive = pathname === "/admin/products/new";
                break;

            case "/admin/products":
                isActive =
                    pathname === "/admin/products" ||
                    (pathname.startsWith("/admin/products/") &&
                        !pathname.startsWith("/admin/products/new"));
                break;

            case "/admin/orders":
                isActive =
                    pathname === "/admin/orders" ||
                    pathname.startsWith("/admin/orders/");
                break;

            case "/admin/delivery-partners":
                isActive =
                    pathname === "/admin/delivery-partners" ||
                    pathname.startsWith("/admin/delivery-partners/");
                break;

            default:
                isActive = pathname === link.href;
        }

        return (
            <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-2.5 rounded-md text-sm transition-colors ${
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
</nav>
              </aside>

              <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
                  {children}
              </main>

            </div>
        </div>
    );
}

export default layout;