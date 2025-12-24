import type { AlbumPreview, ArtistPreview, PlaylistPreview, SongPreview } from "@/graphql/types";
import { Disc, User } from "lucide-react";
import { Link } from "react-router";

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

    let name = "";
    let artistId = "";
    let itemId = "";
    let link: string | null = null;
    let Icon = Disc;

    if (type === "album") {
        name = props.album.name;
        artistId = props.artistId;
        itemId = props.album.id;
        link = `/album/${artistId}/${itemId}`;
    } else if (type === "playlist") {
        name = props.playlist.name;
        itemId = props.playlist.id;
        link = `/playlist/${itemId}`;
    } else if (type === "artist") {
        name = props.artist.name;
        itemId = props.artist.id;
        link = `/artist/${itemId}`;
        Icon = User;
    } else if (type === "song") {
        name = props.song.title;
        itemId = props.song.id;
        link = null;
    }


    return (
        <Link to={link ?? "#"}>
            <div className="group cursor-pointer w-40">
                <div className="w-40 h-40 bg-stone-800 rounded-md flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors">
                    <Icon className="w-20 h-20 text-stone-600 group-hover:text-stone-500 transition-colors" />
                </div>
                <div className="font-medium text-stone-200 truncate group-hover:text-white transition-colors">
                    {name}
                </div>
            </div>
        </Link>
    );
};