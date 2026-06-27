export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <p>banner</p>
            <p>navbar</p>
            <main className="min-h-screen">
                {children}
            </main>
            <p>footer</p>
            <p>cartsidebar</p>
        </>
    );
}