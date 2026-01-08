import { useState } from "react";
import type { Maybe } from "@/graphql/types";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    url: Maybe<string> | undefined
    size?: number
    className?: string
}

export const ArtistPic = ({ url, size = 48, className }: Props) => {
    const [imageLoadingError, setImageLoadingError] = useState(false);

    return (
        <div className={cn(
            `w-${size} h-${size} rounded-full bg-stone-900 flex items-center justify-center shrink-0`,
            className
        )}>
            {url && !imageLoadingError ? (
                <img
                    src={url}
                    crossOrigin="anonymous"
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                    onError={() => {
                        console.log("Artist image load error for:", url);
                        setImageLoadingError(true);
                    }}
                />
            ) : (
                <User className="w-full h-full text-stone-200 p-8" />
            )}
        </div>
    );
};