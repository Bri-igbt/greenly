import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = (await cookies()).get("token");

    if (!token) {
        redirect("/login");
    }

    return <>{children}</>;
}