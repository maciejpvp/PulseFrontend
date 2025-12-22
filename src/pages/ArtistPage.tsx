import { useParams } from "react-router";

export const ArtistPage = () => {
    const params = useParams();

    const artistId = params.artistId;


    return <div>Artist Page {artistId}</div>;
};