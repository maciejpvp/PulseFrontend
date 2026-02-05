import { debounce } from "@/lib/debounce";
import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const UPDATE_REPEAT_MODE = gql`
            mutation UpdateRepeatMode($repeatMode: String) {
                cloudStateUpdate(input: {
                    attributes: {
                        repeatMode: $repeatMode
                    }
                })
            }
        `

const client = generateClient();

export const updateRepeatMode = async (repeatMode: string) => {
    try {
        await client.graphql({
            query: UPDATE_REPEAT_MODE,
            variables: {
                repeatMode
            }
        });
    } catch (error) {
        console.error("Error updating volume:", error);
    }
}

export const debouncedUpdateRepeatMode = debounce((repeatMode: string) => {
    updateRepeatMode(repeatMode);
}, 500);

