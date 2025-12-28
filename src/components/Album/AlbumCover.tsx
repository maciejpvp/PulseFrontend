import { useState } from "react";
import { Disc } from "lucide-react";
import type { Maybe } from "@/graphql/types";

type Props = {
    imageUrl: Maybe<string> | undefined;
};

export const AlbumCover = ({ imageUrl }: Props) => {
    const [imageLoadingError, setImageLoadingError] = useState(false);

    console.log(imageLoadingError);

    return (
        <div className="w-64 h-64 bg-stone-800 shadow-2xl flex items-center justify-center rounded-sm shrink-0">
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
                <Disc className="w-32 h-32 text-stone-600" />
            )}
        </div>
    );
};
