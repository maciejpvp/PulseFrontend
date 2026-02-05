import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import type { Song } from "../types";

const GET_SONG_ITEM = gql`
  query GetSongItem($songId: ID!, $artistId: ID!) {
    song(songId: $songId, artistId: $artistId) {
      id
      title
      duration
      artist {
        id
        name
      }
    }
  }
`;

const client = generateClient();

/**
 * Fetch full song item to use in PlayerBar if we only have SongPreview
 * @param songId Song ID
 * @param artistId Artist ID
 * @returns Song object or null if not found
 */

export const getFullSongItem = async (
  songId: string,
  artistId: string
): Promise<Song | null> => {
  try {
    const response = await client.graphql({
      query: GET_SONG_ITEM,
      variables: { songId, artistId },
    });

    // @ts-expect-error - Amplify GraphQL response typing
    const data = response.data as { song: Song | null };

    return data.song || null;
  } catch (error) {
    console.error("Error fetching song:", error);
    return null;
  }
};