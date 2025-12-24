import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import type { MutationSongPlayArgs } from "../types";

const SONG_PLAY = gql`
mutation SongPlay($input: SongPlayInput!) {
  songPlay(input: $input)
}
`;

const client = generateClient();

export const useSongPlay = () => {
    const playSongMutation = async (args: MutationSongPlayArgs) => {
        try {
            const response = await client.graphql({
                query: SONG_PLAY,
                variables: args,
            });

            // @ts-expect-error - Amplify types
            return response.data.songPlay as string;
        } catch (error) {
            console.error("Error playing song:", error);
            throw error;
        }
    };

    return { playSongMutation };
};
