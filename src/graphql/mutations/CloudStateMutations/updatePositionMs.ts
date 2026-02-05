import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const UPDATE_POSITION_MS = gql`
    mutation UpdatePosition($position: String $positionUpdatedAt: String) {
        cloudStateUpdate(input: {
            attributes: {
                positionMs: $position
                positionUpdatedAt: $positionUpdatedAt
            }
        })
    }
`

const client = generateClient();

export const updatePositionMs = async (positionMs: number) => {
    const now = Date.now();
    try {
        await client.graphql({
            query: UPDATE_POSITION_MS,
            variables: {
                position: `${positionMs}`,
                positionUpdatedAt: `${now}`
            }
        });
    } catch (error) {
        console.error("Error updating position:", error);
    }
}


