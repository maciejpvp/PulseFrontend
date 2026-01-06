import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";

import type { SongPreview, AlbumPreview, ArtistPreview, PlaylistPreview } from "../types";

type RecentItem = SongPreview | AlbumPreview | ArtistPreview | PlaylistPreview;

const GET_RECENTLY_PLAYED = gql`
  query GetRecentlyPlayed {
    recentPlayed {
      __typename
      ... on SongPreview {
        id
        artistId
        title
        imageUrl
      }
      ... on AlbumPreview {
        id
        imageUrl
        artist {
          id
          imageUrl
        }
        name
      }
      ... on ArtistPreview {
        id
        name
        imageUrl
      }
      ... on PlaylistPreview {
        id
        name
        imageUrl
      }
    }
  }
`;

const client = generateClient();

interface UseRecentResult {
  recentItems: RecentItem[];
  isLoading: boolean;
  isError: boolean;
}

export const useRecent = (): UseRecentResult => {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecent = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await client.graphql({
          query: GET_RECENTLY_PLAYED,
        });

        // @ts-expect-error - Handling Amplify's generic response type
        const data = response.data as { recentPlayed: RecentItem[] };
        setRecentItems(data.recentPlayed || []);
      } catch (error) {
        console.error("Error fetching recently played:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return { recentItems, isLoading, isError };
};