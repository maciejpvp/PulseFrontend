import { useState } from "react";
import { Disc } from "lucide-react";
import type { Maybe } from "@/graphql/types";
import { cn } from "@/lib/utils";

type Props = {
    imageUrl: Maybe<string> | undefined;
    className?: string;
};

export const AlbumCover = ({ imageUrl, className }: Props) => {
    const [imageLoadingError, setImageLoadingError] = useState(false);

    return (
        <div className={cn(
            "bg-stone-800 shadow-2xl flex items-center justify-center rounded-sm shrink-0",
            className
        )}>
            {imageUrl && !imageLoadingError ? (
                <img
                    src={imageUrl}
                    alt="Album"
                    className="w-full h-full object-cover rounded-sm"
                    onError={() => {
                        console.log("Image load error for:", imageUrl);
                        setImageLoadingError(true);
                    }}
                />
            ) : (
                <Disc className="w-1/2 h-1/2 text-stone-600" />
            )}
        </div>
    );
};
