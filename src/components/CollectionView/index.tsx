import { getFullSongItem } from "@/graphql/queries/useGetFullSongItem";
import type { AlbumPreview, ArtistPreview, MutationSongPlayArgs, PlaylistPreview, SongPreview } from "@/graphql/types";
import { usePlayerStore } from "@/store/player.store";
import { Disc, User } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { containerVariants, imageContainerVariants, iconVariants, textVariants } from "./variants";
import { playSongMutation } from "@/graphql/mutations/useSongPlay";
import { updatePositionMs } from "@/graphql/mutations/CloudStateMutations/updatePositionMs";

type BaseProps = VariantProps<typeof containerVariants>;

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
    const { type, viewType = "Box", size = "md" } = props;
    const navigate = useNavigate();

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
            updatePositionMs(0);
        }
    }

    return (
        <div
            className={cn(containerVariants({ viewType, size }))}
            onClick={handleClick}
        >
            <div className={cn(imageContainerVariants({ viewType, size }))}>
                {imageUrl ? (
                    <img src={imageUrl} crossOrigin="anonymous" alt={name} className="w-full h-full object-cover" />
                ) : (
                    <Icon className={cn(iconVariants({ viewType, size }))} />
                )}
            </div>
            <div className={cn(textVariants({ viewType, size }))}>
                {name}
            </div>
        </div>
    );
};

export { CollectionViewSkeleton } from "./CollectionViewSkeleton";