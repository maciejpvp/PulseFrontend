import { debounce } from "@/lib/debounce";
import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const UPDATE_SHUFFLE_MODE = gql`
            mutation UpdateShuffleMode($shuffleMode: String) {
                cloudStateUpdate(input: {
                    attributes: {
                        shuffleMode: $shuffleMode
                    }
                })
            }
        `

const client = generateClient();

export const updateShuffleMode = async (shuffleMode: boolean) => {
    const mode = shuffleMode ? "ON" : "OFF";
    try {
        await client.graphql({
            query: UPDATE_SHUFFLE_MODE,
            variables: {
                shuffleMode: mode
            }
        });
    } catch (error) {
        console.error("Error updating shuffle mode:", error);
    }
}

export const debouncedUpdateShuffleMode = debounce((shuffleMode: boolean) => {
    updateShuffleMode(shuffleMode);
}, 500);


