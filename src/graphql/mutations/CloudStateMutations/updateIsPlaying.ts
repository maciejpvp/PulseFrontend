import { debounce } from "@/lib/debounce";
import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const UPDATE_IS_PLAYING = gql`
            mutation UpdateIsPlaying($isPlaying: Boolean, $position: String, $now: String) {
                cloudStateUpdate(input: {
                    attributes: {
                        isPlaying: $isPlaying,
                        positionMs: $position,
                        positionUpdatedAt: $now
                    }
                })
            }
        `

const client = generateClient();

export const updateIsPlaying = async (isPlaying: boolean, position?: number) => {
    const now = Date.now();

    try {
        await client.graphql({
            query: UPDATE_IS_PLAYING,
            variables: {
                isPlaying,
                position: `${position}`,
                now: `${now}`
            }
        });
    } catch (error) {
        console.error("Error updating isPlaying:", error);
    }
}

export const debouncedUpdateIsPlaying = debounce((isPlaying: boolean, position?: number) => {
    updateIsPlaying(isPlaying, position);
}, 50);

