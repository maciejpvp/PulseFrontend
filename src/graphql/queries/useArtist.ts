import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import type { Artist, QueryArtistArgs } from "../types";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidId = (id: string) => UUID_V4_REGEX.test(id);

const GET_ARTIST = gql`
  query GetArtist($artistId: ID!) {
    artist(artistId: $artistId) {
      id
      name
      avatarUrl
      albums {
        edges {
          node {
            id
            name
          }
        }
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
            }
          }
        }
      }
    }
  }
`;

const client = generateClient();

interface UseArtistResult {
  artist: Artist | null;
  isLoading: boolean;
  isError: boolean;
}

export const useArtist = (artistId: string): UseArtistResult => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await client.graphql({
          query: GET_ARTIST,
          variables: { artistId } as QueryArtistArgs,
        });

        // @ts-expect-error - Amplify types are sometimes tricky with generated types
        const data = response.data as { artist: Artist };
        setArtist(data.artist);
      } catch (error) {
        console.error("Error fetching artist:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (artistId && isValidId(artistId)) {
      fetchArtist();
    }
  }, [artistId]);

  return { artist, isLoading, isError };
};