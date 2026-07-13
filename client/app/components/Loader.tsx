import { Loader2Icon } from "lucide-react";

const Loader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <Loader2Icon className="size-10 animate-spin text-app-green" />
        </div>
    );
};

export default Loader;