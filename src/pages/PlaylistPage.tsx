import { useParams } from "react-router";
import { usePlaylist } from "../graphql/queries/usePlaylist";
import { Disc, Clock } from "lucide-react";
import { ErrorPage } from "./Error";
import { SongItem } from "@/components/SongItem";
import { usePlayerStore } from "@/store/player.store";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import type { Song } from "../graphql/types";

export const PlaylistPage = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const { playlist, isLoading, isError } = usePlaylist(playlistId ?? "");
    const { playSong } = usePlayerStore();
    const { playSongMutation } = useSongPlay();

    if (isLoading) return <div className="p-8 text-stone-400">Loading...</div>;
    if (isError || !playlist) return <ErrorPage />;

    const songs = playlist.songs.edges.map((edge) => edge.node);

    const handlePlaySong = async (song: Song) => {
        try {
            const url = await playSongMutation({
                input: {
                    songId: song.id,
                    artistId: song.artist.id,
                    contextId: playlist.id,
                    contextType: "PLAYLIST"
                }
            });
            playSong(song, url, playlist.id, "PLAYLIST", songs);
        } catch (error) {
            console.error("Failed to play song:", error);
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-stone-950 text-stone-200">
            <div className="flex items-end gap-8 p-8 bg-gradient-to-b from-stone-800/50 to-stone-950">
                <div className="w-64 h-64 bg-stone-800 shadow-2xl flex items-center justify-center rounded-sm shrink-0">
                    <Disc className="w-32 h-32 text-stone-600" />
                </div>

                <div className="flex flex-col gap-2 pb-2">
                    <span className="text-sm font-medium uppercase tracking-wider text-stone-400">Playlist</span>
                    <h1 className="text-6xl font-black text-white tracking-tight">{playlist.name}</h1>
                    <div className="flex items-center gap-2 text-stone-300 font-medium mt-4">
                        <span className="text-stone-400">{songs.length} songs</span>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8">
                <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 border-b border-stone-800 text-stone-400 text-sm uppercase tracking-wider mb-4">
                    <span>#</span>
                    <span>Title</span>
                    <Clock className="w-4 h-4" />
                </div>

                <div className="flex flex-col">
                    {songs.map((song, index) => (
                        <div key={song.id} className="flex items-center gap-4 group">
                            <span className="text-stone-500 group-hover:text-stone-300 text-sm font-medium tabular-nums w-4 text-center">
                                {index + 1}
                            </span>
                            <SongItem
                                song={song}
                                onClick={() => handlePlaySong(song)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


