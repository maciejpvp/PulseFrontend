import type { Song } from "@/graphql/types";
import { formatTime } from "@/lib/formatTime";
import { Disc } from "lucide-react";

interface SongItemProps {
    song: Song;
}

export const SongItem = ({ song }: SongItemProps) => {
    // const [imageError, setImageError] = useState(false);

    console.log(song);

    const hasImage = false;

    const duration = formatTime(song.duration ?? 0);

    return (
        <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md transition-colors group cursor-pointer w-full">
            <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-stone-800">
                {hasImage ? (
                    <img
                        alt={song.title}
                        className="w-full h-full object-cover"
                    // onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-600">
                        <Disc className="w-6 h-6" />
                    </div>
                )}
            </div>
            <div className="flex flex-row justify-between items-center overflow-hidden w-full max-w-2/3">
                <span className="font-medium truncate text-stone-200 group-hover:text-white transition-colors">
                    {song.title}
                </span>
                <span className="text-sm text-stone-500 truncate group-hover:text-stone-400 transition-colors">
                    {duration}
                </span>
            </div>
        </div>
    );
};