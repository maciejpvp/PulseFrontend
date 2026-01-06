import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useState } from "react";
import type {
    PlaylistAddSongInput,
    PlaylistRemoveSongInput
} from "../types";

const PLAYLIST_ADD_SONG = gql`
  mutation PlaylistAddSong($input: PlaylistAddSongInput!) {
    playlistAddSong(input: $input) {
      playlistId
    }
  }
`;

const PLAYLIST_REMOVE_SONG = gql`
  mutation PlaylistRemoveSong($input: PlaylistRemoveSongInput!) {
    playlistRemoveSong(input: $input) {
      playlistId
    }
  }
`;

const client = generateClient();

export const usePlaylist = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const addSong = async (input: PlaylistAddSongInput): Promise<boolean> => {
        setIsAdding(true);
        try {
            await client.graphql({
                query: PLAYLIST_ADD_SONG,
                variables: {
                    input
                }
            });
            return true;
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            return false;
        } finally {
            setIsAdding(false);
        }
    };

    const removeSong = async (input: PlaylistRemoveSongInput): Promise<boolean> => {
        setIsRemoving(true);
        try {
            await client.graphql({
                query: PLAYLIST_REMOVE_SONG,
                variables: {
                    input
                }
            });
            return true;
        } catch (error) {
            console.error("Error removing song from playlist:", error);
            return false;
        } finally {
            setIsRemoving(false);
        }
    };

    return {
        addSong,
        removeSong,
        isAdding,
        isRemoving
    };
};
