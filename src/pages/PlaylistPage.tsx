import { useNavigate, useParams } from "react-router";
import { useAlbum } from "../graphql/queries/useAlbum";
import { Disc, Clock, User } from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import { ErrorPage } from "./Error";

export const AlbumPage = () => {
    const navigate = useNavigate();
    const { albumId, artistId } = useParams<{ albumId: string; artistId: string }>();
    const { album, isLoading, isError } = useAlbum(albumId ?? "", artistId ?? "");

    if (isLoading) return <div className="p-8 text-stone-400">Loading...</div>;
    if (isError || !album) return <ErrorPage />;

    const songs = album.songs.edges.map((edge) => edge.node);

    const handleNavigateToArtist = () => {
        navigate(`/artist/${artistId}`);
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-stone-950 text-stone-200">
            <div className="flex items-end gap-8 p-8 bg-gradient-to-b from-stone-800/50 to-stone-950">
                <div className="w-64 h-64 bg-stone-800 shadow-2xl flex items-center justify-center rounded-sm shrink-0">
                    <Disc className="w-32 h-32 text-stone-600" />
                </div>

                <div className="flex flex-col gap-2 pb-2">
                    <span className="text-sm font-medium uppercase tracking-wider text-stone-400">Album</span>
                    <h1 className="text-6xl font-black text-white tracking-tight">{album.name}</h1>
                    <div className="flex items-center gap-2 text-stone-300 font-medium mt-4">
                        <div className="w-6 h-6 bg-stone-700 rounded-full flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <span className="hover:underline cursor-pointer" onClick={handleNavigateToArtist}>{album.artist.name}</span>
                        <span className="text-stone-500">•</span>
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
                        <div
                            key={song.id}
                            className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-3 hover:bg-white/5 rounded-md group transition-colors items-center"
                        >
                            <span className="text-stone-500 group-hover:text-stone-300 text-sm font-medium tabular-nums">
                                {index + 1}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-white font-medium text-base">{song.title}</span>
                                <span className="text-stone-500 text-sm group-hover:text-stone-400">
                                    {album.artist.name}
                                </span>
                            </div>
                            <span className="text-stone-500 text-sm font-medium tabular-nums">
                                {song.duration ? formatTime(song.duration) : "--:--"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


