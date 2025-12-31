import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect, useState } from "react";
import type { BookmarkConnection, BookmarkItem } from "../types";

const GET_BOOKMARKS = gql`
  query GetBookmarks {
    bookmarks {
      edges {
        node {
          __typename
          ... on PlaylistPreview {
            id
            name
            imageUrl
          }
          ... on AlbumPreview {
            id
            name
            artist {
              id
            }
          }
        }
      }
    }
  }
`;

const client = generateClient();

interface UseBookmarksResult {
  bookmarks: BookmarkItem[];
  isLoading: boolean;
  isError: boolean;
}

export const useBookmarks = (): UseBookmarksResult => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await client.graphql({
          query: GET_BOOKMARKS,
        });

        // @ts-expect-error - Amplify types are sometimes tricky with generated types
        const data = response.data as { bookmarks: BookmarkConnection };
        const items = data.bookmarks.edges?.map((edge) => edge.node) || [];
        setBookmarks(items as BookmarkItem[]);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  return { bookmarks, isLoading, isError };
};
