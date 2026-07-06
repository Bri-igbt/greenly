import Banner from "@/app/components/Banner";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";


export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Banner />
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
            <p>cartsidebar</p>
        </>
    );
}