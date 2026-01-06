import { useParams } from "react-router";
import { useArtist } from "../graphql/queries/useArtist";
import { ArtistPic } from "@/components/Artist/ArtistPic";
import { CollectionView } from "@/components/CollectionView";
import { ErrorPage } from "./Error";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useImageColor } from "@/hooks/useImageColor";

export const ArtistPage = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const { artist, isLoading, isError } = useArtist(artistId ?? "");
    const mainColor = useImageColor(artist?.imageUrl);

    if (isLoading) return <div className="p-8 text-stone-400">Loading...</div>;
    if (isError || !artist) return <ErrorPage />;

    const albums = (artist.albums?.edges || []).map((edge) => edge.node);

    return (
        <div className="w-full h-full overflow-y-auto relative custom-scrollbar">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(to bottom, ${mainColor}, transparent 50%)`,
                    zIndex: 0
                }}
            />
            <div className="relative z-10">
                <div className="flex flex-row items-center gap-8 p-8">
                    <ArtistPic key={artistId} url={artist.imageUrl} size={64} />
                    <div className="flex flex-col pb-2">
                        <span className="text-sm font-medium uppercase tracking-wider text-stone-400">Artist</span>
                        <h1 className="text-6xl font-black text-white tracking-tight">{artist.name}</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <BookmarkButton itemId={artist.id} itemType="ARTIST" artistId={artist.id} defaultState={artist.isBookmarked} />
                            <span className="text-stone-400 font-medium">{albums.length} albums</span>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Albums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {albums.map((album) => (
                            <CollectionView key={album.id} type="album" album={album} artistId={artist.id} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
