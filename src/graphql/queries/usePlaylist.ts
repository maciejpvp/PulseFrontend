import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useCallback, useEffect, useState } from "react";
import type { Playlist } from "../types";

const GET_PLAYLIST = gql`
query GetPlaylist($playlistId: ID!) {
  playlist(playlistId: $playlistId) {
    id
    name
    imageUrl
    isBookmarked
    songs {
      edges {
        node {
          id
          title
          duration
          imageUrl
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
  refetch: () => Promise<void>;
}

export const usePlaylist = (playlistId: string): UsePlaylistResult => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchPlaylist = useCallback(async () => {
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
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId, fetchPlaylist]);

  return { playlist, isLoading, isError, refetch: fetchPlaylist };
};
