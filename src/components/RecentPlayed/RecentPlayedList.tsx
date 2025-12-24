import type { RecentPlayedItem } from "@/graphql/types";
import { CollectionView } from "../CollectionView";

type Props = {
    recentItems: RecentPlayedItem[];
}

export const RecentPlayedList = ({ recentItems }: Props) => {
    console.log(recentItems);

    return (
        <div>
            <h2 className="text-2xl font-bold mt-4">Recently Played</h2>

            <div className="grid grid-cols-4 gap-4">
                {recentItems.map(item => {
                    if (item.__typename === "SongPreview") {
                        return (
                            <CollectionView key={item.id} type="song" song={item} artistId={item.artistId} />
                        )
                    }
                    if (item.__typename === "AlbumPreview") {
                        return (
                            <CollectionView key={item.id} type="album" album={item} artistId={item.artist.id} />
                        )
                    }
                    if (item.__typename === "ArtistPreview") {
                        return (
                            <CollectionView key={item.id} type="artist" artist={item} />
                        )
                    }
                    if (item.__typename === "PlaylistPreview") {
                        return (
                            <CollectionView key={item.id} type="playlist" playlist={item} />
                        )
                    }
                })}
            </div>

        </div>
    );
};