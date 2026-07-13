"use client";

import { useCart } from "@/app/context/CartContext";
import type { Order } from "@/app/types";
import { dummyDashboardOrdersData } from "@/assets/assets";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import { CalendarIcon, ChevronRightIcon, Loader2Icon, PackageIcon } from "lucide-react";
import Link from "next/link";
import Loader from "@/app/components/Loader";
import { statusColors } from "@/app/utils/data";

const Page = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const { clearCart } = useCart();

    const tabs = ["all", "Placed", "Out for Delivery", "Delivered"];

    const fetchOrders = async () => {
        setLoading(true);
        setTimeout(() => {
            setOrders(dummyDashboardOrdersData as Order[]);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        const shouldClearCart = searchParams.get("clearCart");

        if (shouldClearCart === "true") {
            clearCart();
            router.replace(pathname);
        }

        fetchOrders();

    }, [activeTab]);

    return (
        <div className="min-h-screen bg-app-cream mb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-app-green mb-6">My Orders</h1>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab)=> (
                        <button 
                            key={tab} 
                            onClick={()=> setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${activeTab === tab ? "bg-app-green text-white" : "bg-white text-app-text-light hover:bg-app-cream"}`}
                        >
                            {tab === 'all' ? "All Orders" : tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <Loader />
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <PackageIcon className="size-16 text-app-border mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-app-green mb-2">
                            No orders yet
                        </h2>
                        <p className="text-sm text-app-text-light mb-4">
                            Start shopping to see your orders here 
                        </p>
                        <Link href='/products' className="inline-flex px-4 py-2 bg-app-green text-white text-sm rounded-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order)=> (
                            <Link 
                                key={order._id} 
                                href={`/orders/${order._id}`}
                                className="block max-w-4xl bg-white rounded-2xl p-5 hover:shadow transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-medium text-app-green">
                                            Orders #{order._id.slice(-8).toUpperCase()}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <CalendarIcon className="size-3 text-app-text-light" />

                                            <span className="text-xs text-app-text-light">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-4 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                            {order.status} 
                                        </span>
                                        <ChevronRightIcon className="size-4 text-app-text-light" />
                                    </div>

                                </div>

                                <div></div>

                                <div></div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;