import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionViewSkeleton } from "@/components/CollectionView";

export const PlaylistSkeleton = () => {
    return (
        <div className="w-full h-full overflow-y-auto relative custom-scrollbar">
            <div className="relative z-10">
                <div className="flex items-end gap-8 p-8">
                    <Skeleton className="w-48 h-48 md:w-64 md:h-64 shadow-lg rounded-md" />
                    <div className="flex flex-col gap-4 pb-2 w-full">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-12 md:h-16 w-3/4 md:w-1/2" />
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 border-b border-stone-800 text-stone-400 text-sm uppercase tracking-wider mb-4">
                        <span>#</span>
                        <span>Title</span>
                        <Clock className="w-4 h-4" />
                    </div>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="h-12 w-12 rounded-md" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-10" />
                        </div>
                    ))}
                </div>

                <div className="px-8 pb-8">
                    <Skeleton className="h-8 w-48 mb-4 md:mb-6" />
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {[...Array(4)].map((_, i) => (
                            <CollectionViewSkeleton key={i} size="md" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
