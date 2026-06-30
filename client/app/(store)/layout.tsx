import Banner from "@/app/components/Banner";
import Navbar from "@/app/components/Navbar";

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
            <p>footer</p>
            <p>cartsidebar</p>
        </>
    );
}