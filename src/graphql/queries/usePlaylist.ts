import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import type { Playlist } from "../types";

const GET_PLAYLIST = gql`
query GetPlaylist($playlistId: ID!) {
  playlist(playlistId: $playlistId) {
    id
    name
    imageUrl
    songs {
      edges {
        node {
          id
          title
          duration
          artist {
            id
            name
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
`;

const client = generateClient();

interface UsePlaylistResult {
  playlist: Playlist | null;
  isLoading: boolean;
  isError: boolean;
}

export const usePlaylist = (playlistId: string): UsePlaylistResult => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await client.graphql({
          query: GET_PLAYLIST,
          variables: { playlistId },
        });

        // @ts-expect-error - Amplify types
        const data = response.data as { playlist: Playlist };
        setPlaylist(data.playlist);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  return { playlist, isLoading, isError };
};
