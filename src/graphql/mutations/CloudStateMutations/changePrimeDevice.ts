import { generateClient } from "aws-amplify/api";
import gql from "graphql-tag";

const CHANGE_PRIME_DEVICE = gql`
            mutation ChangePrimeDevice($primeDeviceId: String) {
                cloudStateUpdate(input: {
                    attributes: {
                        primeDeviceId: $primeDeviceId
                    }
                })
            }
        `

const client = generateClient();

export const changePrimeDevice = async (id: string) => {
    try {
        await client.graphql({
            query: CHANGE_PRIME_DEVICE,
            variables: {
                primeDeviceId: id
            }
        });
    } catch (error) {
        console.error("Error updating isPlaying:", error);
    }
}
