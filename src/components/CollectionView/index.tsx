import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import { getFullSongItem } from "@/graphql/queries/useGetFullSongItem";
import type { AlbumPreview, ArtistPreview, MutationSongPlayArgs, PlaylistPreview, SongPreview } from "@/graphql/types";
import { usePlayerStore } from "@/store/player.store";
import { Disc, User } from "lucide-react";
import { useNavigate } from "react-router";

type Props = {
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
}

export const CollectionView = (props: Props) => {
    const { type } = props;
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
            playSong(fullSong, url, artistId, "ARTIST", [])
        }
    }


    return (
        <div className="group cursor-pointer w-40" onClick={handleClick}>
            <div className="w-40 h-40 bg-stone-800 rounded-md flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <Icon className="w-20 h-20 text-stone-600 group-hover:text-stone-500 transition-colors" />
                )}
            </div>
            <div className="font-medium text-stone-200 truncate group-hover:text-white transition-colors">
                {name}
            </div>
        </div>
    );
};