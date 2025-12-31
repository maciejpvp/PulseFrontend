
import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import type { Album, QueryAlbumArgs } from "../types";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidId = (id: string) => UUID_V4_REGEX.test(id);

const GET_ALBUM = gql`
query GetAlbum($input: AlbumQueryInput!) {
album(input: $input) {
  id
  name
  imageUrl
  isBookmarked
  artist {
    id
    name
  }
  songs {
    edges {
      node {
        id
        title
        duration
        artist {
          id
          name
          imageUrl 
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

interface UseAlbumResult {
  album: Album | null;
  isLoading: boolean;
  isError: boolean;
}

export const useAlbum = (albumId: string, artistId: string): UseAlbumResult => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await client.graphql({
          query: GET_ALBUM,
          variables: { input: { albumId, artistId } } as QueryAlbumArgs,
        });

        // @ts-expect-error - Amplify types are sometimes tricky with generated types
        const data = response.data as { album: Album };
        setAlbum(data.album);
      } catch (error) {
        console.error("Error fetching album:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (albumId && isValidId(albumId) && artistId && isValidId(artistId)) {
      fetchAlbum();
    }
  }, [albumId, artistId]);

  return { album, isLoading, isError };
};