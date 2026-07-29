"use client";

const Loading = () => {
    return (
        <div className="min-h-screen bg-app-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Hero Skeleton */}
            <div className="animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-5 w-96 max-w-full bg-gray-200 rounded mb-10"></div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm"
                >
                    {/* Image */}
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>

                    <div className="p-4 space-y-3">
                    {/* Category */}
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>

                    {/* Title */}
                    <div className="h-5 w-full bg-gray-200 rounded"></div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded"></div>

                    {/* Price */}
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>

                    {/* Button */}
                    <div className="h-10 w-full bg-gray-200 rounded-xl mt-4"></div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
};

export default Loading;