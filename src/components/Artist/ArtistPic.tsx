import { useState } from "react";
import type { Maybe } from "@/graphql/types";
import { User } from "lucide-react";

type Props = {
    url: Maybe<string> | undefined
}

export const ArtistPic = ({ url }: Props) => {
    const [imageLoadingError, setImageLoadingError] = useState(false);

    return (
        <div className="w-48 h-48 rounded-full bg-stone-900 flex items-center justify-center">
            {url && !imageLoadingError ? (
                <img
                    src={url}
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