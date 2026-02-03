import { debounce } from "@/lib/debounce";
import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const UPDATE_IS_PLAYING = gql`
            mutation UpdateIsPlaying($isPlaying: Boolean) {
                cloudStateUpdate(input: {
                    attributes: {
                        isPlaying: $isPlaying
                    }
                })
            }
        `

const client = generateClient();

export const updateIsPlaying = async (isPlaying: boolean) => {
    try {
        await client.graphql({
            query: UPDATE_IS_PLAYING,
            variables: {
                isPlaying
            }
        });
    } catch (error) {
        console.error("Error updating isPlaying:", error);
    }
}

export const debouncedUpdateIsPlaying = debounce((isPlaying: boolean) => {
    updateIsPlaying(isPlaying);
}, 200);

