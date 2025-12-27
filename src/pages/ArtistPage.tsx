import { useParams } from "react-router";
import { useArtist } from "../graphql/queries/useArtist";
import { ArtistPic } from "@/components/Artist/ArtistPic";
import { SongItem } from "@/components/SongItem";
import { CollectionView } from "@/components/CollectionView";
import { ErrorPage } from "./Error";
import { usePlayerStore } from "@/store/player.store";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import type { Song } from "../graphql/types";

export const ArtistPage = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const { artist, isLoading, isError } = useArtist(artistId ?? "");
    const { playSong } = usePlayerStore();
    const { playSongMutation } = useSongPlay();

    if (isLoading) return <div>Loading...</div>;
    if (isError || !artist) return <ErrorPage />;

    console.log(artist)

    const albums = artist.albums.edges.map((edge) => edge.node);
    const songs = artist.songs.edges.map((edge) => edge.node);

    const handlePlaySong = async (song: Song) => {
        try {
            const url = await playSongMutation({
                input: {
                    songId: song.id,
                    artistId: artist.id,
                    contextId: artist.id,
                    contextType: "ARTIST"
                }
            });
            playSong(song, url, artist.id, "ARTIST", songs);
        } catch (error) {
            console.error("Failed to play song:", error);
        }
    };

    return <div className="w-full">
        <div className="flex items-start gap-4">
            <ArtistPic url={artist.avatarUrl} />
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold mt-4">{artist.name}</h1>
                <button className="bg-stone-800 text-stone-200 px-4 py-2 rounded-md hover:bg-stone-700 transition-colors">Follow</button>
            </div>
        </div>

        <div className="mt-4 w-full">
            <h2 className="text-2xl font-bold">Popular</h2>
            <ul>
                {songs.map((song) => (
                    <SongItem
                        key={song.id}
                        song={song}
                        onClick={() => handlePlaySong(song)}
                    />
                ))}
            </ul>
        </div>

        <div className="mt-4 w-full">
            <h2 className="text-2xl font-bold">Albums</h2>
            <ul>
                {albums.map((album) => (
                    <li key={album.id}>
                        <CollectionView type="album" album={album} artistId={artist.id} />
                    </li>
                ))}
            </ul>
        </div>

    </div>;
};
