import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import type { SearchResponse, BookmarkItem, SearchInput } from "../types";

const client = generateClient();

export const SEARCH_QUERY = gql`
  query Search($input: SearchInput!) {
    search(input: $input) {
      items {
        __typename
        ... on ArtistPreview {
          id
          name
          imageUrl
        }
        ... on AlbumPreview {
          id
          name
          imageUrl
          artist {
            id
            name
          }
        }
        ... on PlaylistPreview {
          id
          name
          imageUrl
        }
        ... on SongPreview {
          id
          title
          artistId
        }
      }
    }
  }
`;

interface UseSearchResult {
    data: BookmarkItem[];
    isLoading: boolean;
    error: unknown;
}

export const useSearch = (query: string, type: string): UseSearchResult => {
    const [data, setData] = useState<BookmarkItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchSearch = async () => {
            if (!query.trim()) {
                setData([]);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await client.graphql({
                    query: SEARCH_QUERY,
                    variables: {
                        input: { query, type }
                    } as { input: SearchInput },
                });

                if ('data' in response && response.data) {
                    const searchData = response.data as { search: SearchResponse };
                    setData(searchData.search.items || []);
                }
            } catch (err) {
                console.error("Error searching:", err);
                setError(err);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearch();
    }, [query, type]);

    return { data, isLoading, error };
};
