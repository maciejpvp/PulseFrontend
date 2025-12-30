import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useState } from "react";
import type {
    BookmarkItemInput
} from "../types";

const BOOKMARK_ADD = gql`
  mutation BookmarkAdd($input: BookmarkAddInput!) {
    bookmarkAdd(input: $input)
  }
`;

const BOOKMARK_REMOVE = gql`
  mutation BookmarkRemove($input: BookmarkRemoveInput!) {
    bookmarkRemove(input: $input)
  }
`;

const client = generateClient();

export const useBookmark = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const addBookmark = async (items: BookmarkItemInput[]): Promise<boolean> => {
        setIsAdding(true);
        try {
            await client.graphql({
                query: BOOKMARK_ADD,
                variables: {
                    input: {
                        items
                    }
                }
            });
        } catch (error) {
            console.error("Error adding bookmark:", error);
            return false
        } finally {
            setIsAdding(false);
        }
        return true
    };

    const removeBookmark = async (itemIds: string[]): Promise<boolean> => {
        setIsRemoving(true);
        try {
            await client.graphql({
                query: BOOKMARK_REMOVE,
                variables: {
                    input: {
                        items: itemIds
                    }
                }
            });
        } catch (error) {
            console.error("Error removing bookmark:", error);
            return false
        } finally {
            setIsRemoving(false);
        }
        return true
    };

    return {
        addBookmark,
        removeBookmark,
        isAdding,
        isRemoving
    };
};