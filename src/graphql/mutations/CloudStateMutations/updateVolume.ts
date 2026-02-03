import { debounce } from "@/lib/debounce";
import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const UPDATE_VOLUME = gql`
            mutation UpdateVolume($volume: Int) {
                cloudStateUpdate(input: {
                    attributes: {
                        volume: $volume
                    }
                })
            }
        `

const client = generateClient();

export const updateVolume = async (volume: number) => {
    try {
        await client.graphql({
            query: UPDATE_VOLUME,
            variables: {
                volume
            }
        });
    } catch (error) {
        console.error("Error updating volume:", error);
    }
}

export const debouncedUpdateVolume = debounce((volume: number) => {
    updateVolume(Math.round(volume * 100));
}, 500);
