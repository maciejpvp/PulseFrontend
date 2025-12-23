import type { AlbumPreview } from "@/graphql/types";
import { Disc } from "lucide-react";

interface AlbumItemProps {
    album: AlbumPreview;
}

export const AlbumItem = ({ album }: AlbumItemProps) => {
    return (
        <div className="group cursor-pointer w-40">
            <div className="w-40 h-40 bg-stone-800 rounded-md flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors">
                <Disc className="w-20 h-20 text-stone-600 group-hover:text-stone-500 transition-colors" />
            </div>
            <div className="font-medium text-stone-200 truncate group-hover:text-white transition-colors">
                {album.name}
            </div>
        </div>
    );
};