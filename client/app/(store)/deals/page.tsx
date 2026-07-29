'use client'

import Loading from "@/app/components/Loading";
import ProductCard from "@/app/components/ProductCard";
import { Product } from "@/app/types"
import { dummyProducts } from "@/assets/assets";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react"

const page = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setProducts(dummyProducts.filter((p) => p.stock > 0));

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="bg-gradient-to-r from-app-orange to-app-orange-dark text-white py-10">
                <div className="flex-center gap-2 mb-3">
                    <Zap className="size-6 fill-white" />
                    <h1 className="text-3xl font-semibold">Flash Deals</h1>
                    <Zap className="size-6 fill-white" />
                </div>

                <p className="mx-auto max-w-md text-white/80">
                    Limited time offers on your favorite organic products. Grab them before they're gone!
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (<Loading />) : (
                    products.length === 0 ? (
                        <div className="text-center py-16">
                            <Zap className="size-16 text-app-border mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-app-green mb-2">No deals right now</h2>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map((product) => product.stock > 0 && (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )
                )}
            </div>

        </div>
    )
}

export default page