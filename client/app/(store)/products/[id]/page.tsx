'use client'

import DummyReviewsSection from "@/app/components/DummyReviewSection";
import Loading from "@/app/components/Loading";
import ProductCard from "@/app/components/ProductCard";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/types";
import { dummyProducts } from "@/assets/assets";
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon, LeafIcon, MinusIcon, PlusIcon, ShoppingCartIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

const page = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
    const {id} = useParams();
    const router = useRouter();
    const {items, addToCart, updateQuantity, removeFromCart} = useCart()

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [localQuantity, setLocalQunatity] = useState(1);

    useEffect(() => {
        setLoading(true);
        setLocalQunatity(1);
        window.scrollTo(0,0);
        const product = dummyProducts.find((p)=> p._id === id);
        setProduct(product!)
        setRelatedProducts(dummyProducts.filter((p)=> p._id !== id))
        setLoading(false);

    }, [id, router])
    
    if(loading) return <Loading />
    if(!product) return null;

    const cartItem = items.find((item)=> item.product._id === product._id)
    const isCart = !!cartItem;
    const displayQuantity = isCart ? cartItem.quantity : localQuantity;
    const categoryLabel = product.category.replace(/-/g, " ");

    const handleMinus = () => {
        if(isCart) {
            if(cartItem.quantity > 1) updateQuantity(product._id, cartItem.quantity - 1)
                else removeFromCart(product._id)
        } else {
            setLocalQunatity(Math.max(1, localQuantity - 1))
        }     
    }

    const handlePlus = () => {
        if(isCart) updateQuantity(product._id, cartItem.quantity + 1)
            else setLocalQunatity(localQuantity + 1)
    }

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
                    <Link href='/' className="hover:text-app-green transition-colors">
                        <HomeIcon className="size-4" />
                    </Link>
                    <span>/</span>
                    <Link href='/product' className="hover:text-app-green transition-colors">
                        Products
                    </Link>
                    <span>/</span>
                    <Link href={`/products?category=${product.category}`} className="hover:text-app-green transition-colors capitalize">
                        {categoryLabel}
                    </Link>
                    <span>/</span>
                    <span className="text-app-green font-medium truncate max-w-[200px]">
                        {product.name}
                    </span>
                </nav>

                <button 
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green transition-colors"
                >
                    <ArrowLeftIcon className="size-4" />
                    Back
                </button>

                <div className="bg-white/50 rounded-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative flex-center p-8 md:p-12 min-h-[320px] md:min-h-[480px]">
                            <Image 
                                src={product.image} 
                                alt={product.name} 
                                className="max-h-[360px] w-auto object-contain" 
                                width={1}
                                height={1}
                            />

                            <div className="absolute top-5 left-5 flex flex-wrap gap-1.5">
                                {product.isOrganic && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-app-green text-white rounded-full">
                                        <LeafIcon className="w-3 h-3" />
                                        Organic
                                    </span>
                                )}

                                {product.discount > 0 && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-app-orange text-white rounded-full">
                                        {product.discount}% OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 md:p-10 flex flex-col justify-center">
                            <span className="text-xs font-medium text-app-text-light tracking-wider mb-2 capitalize">
                                {categoryLabel}
                            </span>

                            <h1 className="text-2xl md:text-3xl font-semibold text-app-green mb-3">
                                {product.name}
                            </h1>

                            {product.rating > 0 && (
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map((star) => (
                                            <StarIcon 
                                                key={star}
                                                className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-app-warning fill-app-warning" : ""}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">{product.rating}</span>
                                    <span className="text-sm text-app-text-light">({product.reviewCount} reviews)</span>
                                </div>
                            )}

                            <div className="flex items-baseline gap-3 mb-5">
                                <span className="text-3xl md:text-4xl font-semibold text-app-green">
                                    {currency}{product.price.toFixed(2)}
                                </span>

                                {product.originalPrice > product.price && (
                                    <span className="line-through text-lg text-app-text-light">
                                        {currency}{product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-app-text-light leading-relaxed mb-6">
                                {product.description}
                            </p>

                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <span className="text-sm text-app-success font-medium">
                                        ✓ In Stock ({product.stock}) available
                                    </span>
                                ) : (
                                    <span className="text-sm text-app-error font-medium">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-app-border rounded-xl overflow-hidden">
                                    <button onClick={handleMinus} className="p-3 hover:bg-app-cream transition-colors">
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                    <span className="px-5 text-sm font-semibold min-w-[40px] text-center">
                                        {displayQuantity}
                                    </span>
                                    <button onClick={handlePlus} className="p-3 hover:bg-app-cream transition-colors">
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <button 
                                    disabled={product.stock === 0}
                                    onClick={()=> {
                                        if(!isCart) addToCart(product, localQuantity)
                                    }}
                                    className={`flex-1 py-3 font-semibold rounded-xl transition-colors flex-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${isCart ? "bg-app-cream text-app-green border border-app-border" : "bg-app-orange text-white hover:bg-app-orange-dark"}`}
                                >
                                    <ShoppingCartIcon className="w-4 h-4" />
                                    {isCart ? "Added to Cart" : "Add to Cart"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {product.reviewCount > 0 && 
                    <DummyReviewsSection product={product} /> 
                }


                {relatedProducts.length > 0 && (
                    <section className="mt-12 mb-44">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-app-green">Related Products</h2>
                                <p className="text-sm text-app-text-light mt-1">More from {categoryLabel}</p>
                            </div>

                            <Link 
                                href={`/products?category=${product.category}`}
                                className="text-sm font-semibold text-app-orange hover:text-app-orange-dark flex items-center gap-1 transition-colors"
                            >
                                View All
                                <ArrowRightIcon className="size-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-8"> 
                            {relatedProducts.slice(0,5).map((rp)=> (
                                <ProductCard key={rp._id} product={rp} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default page