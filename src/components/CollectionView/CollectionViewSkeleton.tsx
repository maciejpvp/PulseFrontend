import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants, imageContainerVariants, textVariants } from "./variants";
import type { VariantProps } from "class-variance-authority";

type CollectionViewSkeletonProps = VariantProps<typeof containerVariants> & {
    className?: string;
};

export const CollectionViewSkeleton = ({
    viewType = "Box",
    size = "md",
    className
}: CollectionViewSkeletonProps) => {
    return (
        <div className={cn(containerVariants({ viewType, size }), "pointer-events-none", className)}>
            <Skeleton className={cn(imageContainerVariants({ viewType, size }), "bg-stone-800/50")} />
            <Skeleton className={cn(
                textVariants({ viewType, size }),
                "h-5 w-32",
                viewType === "Box" && "md:w-full"
            )} />
        </div>
    );
};
