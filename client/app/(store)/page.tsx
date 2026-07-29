import Hero from '@/app/components/home/Hero'
import Feature from '@/app/components/home/Feature'
import Categories from '@/app/components/home/Categories'
import PopularProduct from '@/app/components/home/PopularProduct'
import AppBanner from '@/app/components/home/AppBanner'
import Newsletter from '@/app/components/home/Newsletter'


const page = () => {
    return (
        <div className='min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-app-cream'>
            <Hero />
            <Feature />
            <Categories />
            <PopularProduct />
            <AppBanner />
            <Newsletter />
        </div>
    )
}

export default page