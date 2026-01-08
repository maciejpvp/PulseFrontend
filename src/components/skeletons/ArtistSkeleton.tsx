import { Skeleton } from "@/components/ui/skeleton";
import { CollectionViewSkeleton } from "@/components/CollectionView";

export const ArtistSkeleton = () => {
    return (
        <div className="w-full h-full overflow-y-auto relative custom-scrollbar">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(to bottom, rgb(28 25 23), transparent 50%)`,
                    zIndex: 0
                }}
            />
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 p-4 md:p-8 text-center md:text-left">
                    <Skeleton className="w-32 h-32 md:w-64 md:h-64 shadow-lg rounded-full" />
                    <div className="flex flex-col pb-2 w-full md:w-auto">
                        <Skeleton className="h-4 w-16 mb-2 md:mb-2" />
                        <Skeleton className="h-10 md:h-16 w-48 md:w-96 mb-4 md:mb-0" />
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-2 md:mt-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-8 pb-8">
                    <Skeleton className="h-8 w-32 mb-4 md:mb-6" />
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <CollectionViewSkeleton key={i} size="lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
