'use client'

import Loader from "@/app/components/Loader";
import ProductCard from "@/app/components/ProductCard";
import { Product } from "@/app/types";
import { dummyProducts } from "@/assets/assets";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"

const page = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.trim() || "";

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        setLoading(true);

        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const filteredProducts = dummyProducts.filter((product) =>
            product.name.toLowerCase().includes(query.toLowerCase())
        );

        setProducts(filteredProducts);
        setLoading(false);
    }, [query]);

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
                    <Link href='/' className="hover:text-app-green transition-colors">
                        <Home className="size-4" />
                    </Link>
                    <span>/</span>
                    <span className="text-app-green font-medium">Search Results</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-app-green mb-1">
                        Result for "{query}"
                    </h1>

                    <p className="text-sm text-app-text-light">
                        {loading ? "Searching..." : `${products.length} items found`}
                    </p>
                </div>

                {loading ? (
                    <Loader />
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="size-16 text-app-border mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-app-green mb-2">
                            No result found
                        </h2>
                        <p className="text-sm text-app-text-light mb-6 max-w-md mx-auto">
                            We couldn't find any products matching "{query}". Try a different search term.
                        </p>

                        <Link 
                            href='/products'
                            className="inline-flex px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-lg"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product)=> (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default page