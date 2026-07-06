'use client'

import { Product } from '@/app/types'
import { dummyProducts } from '@/assets/assets'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import ProductCard from '../ProductCard'

const PopularProduct = () => {
    const [products, setProduct] = useState<Product[]>([])

    useEffect(() => {
        setProduct(dummyProducts.slice(0,10))
    }, [])
    

    return (
        <div className='pb-16'>
            <div className='max-w-7xl mx-auto'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h2 className='text-2xl font-semibold'>Popular Product</h2>
                        <p className='text-sm text-app-text-light mt-1'>Our Most Loved Products This Season</p>
                    </div>

                    <Link href='/products' className='text-sm font-semibold text-app-orange hover:text-app-orange-dark flex items-center gap-1 transition-colors'>
                        View All
                        <ArrowRightIcon className='size-4'/>
                    </Link>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-8'>
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PopularProduct
