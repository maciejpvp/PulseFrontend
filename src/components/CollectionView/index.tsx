import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import { getFullSongItem } from "@/graphql/queries/useGetFullSongItem";
import type { AlbumPreview, ArtistPreview, MutationSongPlayArgs, PlaylistPreview, SongPreview } from "@/graphql/types";
import { usePlayerStore } from "@/store/player.store";
import { Disc, User } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

type BaseProps = {
    viewType?: "Box" | "List";
}

type Props = BaseProps & ({
    type: "album";
    album: AlbumPreview;
    artistId: string;
} | {
    type: "playlist";
    playlist: PlaylistPreview;
} | {
    type: "artist";
    artist: ArtistPreview;
} | {
    type: "song";
    song: SongPreview;
    artistId: string;
})

export const CollectionView = (props: Props) => {
    const { type, viewType = "Box" } = props;
    const navigate = useNavigate();

    const { playSongMutation } = useSongPlay();
    const { playSong } = usePlayerStore();

    let name = "";
    let artistId = "";
    let itemId = "";
    let link: string | null = null;
    let Icon = Disc;
    let imageUrl = "";

    if (type === "album") {
        name = props.album.name;
        artistId = props.artistId;
        itemId = props.album.id;
        link = `/album/${artistId}/${itemId}`;
        imageUrl = props.album.imageUrl || "";
    } else if (type === "playlist") {
        name = props.playlist.name;
        itemId = props.playlist.id;
        link = `/playlist/${itemId}`;
        imageUrl = props.playlist.imageUrl || "";
    } else if (type === "artist") {
        name = props.artist.name;
        itemId = props.artist.id;
        link = `/artist/${itemId}`;
        Icon = User;
        imageUrl = props.artist.imageUrl || "";
    } else if (type === "song") {
        name = props.song.title;
        itemId = props.song.id;
        artistId = props.artistId;
        link = null;
    }

    const handleClick = async () => {
        if (link) {
            navigate(link);
        }
        if (type === "song") {
            const input: MutationSongPlayArgs = {
                input: {
                    songId: itemId,
                    artistId: artistId,
                    contextId: artistId,
                    contextType: "ARTIST"
                }
            };
            console.log(input);

            const fullSong = await getFullSongItem(itemId, artistId);

            if (!fullSong) {
                console.error("Song not found");
                return;
            }

            console.log(fullSong);

            const url = await playSongMutation(input);
            playSong(fullSong, url, artistId, "ARTIST", fullSong.artist.name, [])
        }
    }

    // If viewType is explicitly provided, use it. Otherwise, default to responsive behavior.
    const isList = viewType === "List";
    const isBox = viewType === "Box";

    return (
        <div
            className={cn(
                "group cursor-pointer transition-all",
                // Box behavior: List on mobile, Box on desktop
                isBox && "w-full flex flex-row items-center gap-3 p-2 hover:bg-white/5 rounded-md md:w-40 md:flex-col md:p-0 md:hover:bg-transparent md:rounded-none bg-stone-900 md:bg-transparent",
                // List behavior: Always List
                isList && "w-full flex flex-row items-center gap-3 p-2 hover:bg-white/5 rounded-md bg-stone-800 md:bg-transparent"
            )}
            onClick={handleClick}
        >
            <div className={cn(
                "bg-stone-800 rounded-md flex items-center justify-center group-hover:bg-stone-700 transition-colors overflow-hidden shrink-0",
                isBox && "w-12 h-12 md:w-40 md:h-40 md:mb-3",
                isList && "w-12 h-12"
            )}>
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <Icon className={cn(
                        "text-stone-600 group-hover:text-stone-500 transition-colors",
                        isBox && "w-6 h-6 md:w-20 md:h-20",
                        isList && "w-6 h-6"
                    )} />
                )}
            </div>
            <div className={cn(
                "font-medium text-stone-200 truncate group-hover:text-white transition-colors",
                isBox && "text-sm md:text-base md:w-full",
                isList && "text-sm flex-1"
            )}>
                {name}
            </div>
        </div>
    );
};