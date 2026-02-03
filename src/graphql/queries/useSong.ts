import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

export const GET_SONG = gql`
query GetSong($songId: ID! $artistId: ID!) {
  song(songId: $songId artistId: $artistId) {
    id
    title
    artist {
      id
      name
      imageUrl
    }
    duration
    imageUrl
  }
}
`;

const client = generateClient();

export const getSong = async (songId: string, artistId: string) => {
    try {
        const response = await client.graphql({
            query: GET_SONG,
            variables: { songId, artistId },
        });

        // @ts-expect-error - Amplify types are sometimes tricky with generated types
        const data = response.data as { song: Song };
        console.log("SONG DATA: ", data)
        return data.song;
    } catch (error) {
        console.error("Error fetching song:", error);

        return null;
    }
}   