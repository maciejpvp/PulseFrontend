import { generateClient } from "aws-amplify/api";
import { gql } from "graphql-tag";
import type { CloudState } from "../types";

const GET_CLOUDSTATE = gql`
query GetCloudState {
  cloudState {
    primeDeviceId
    trackId
    trackArtistId
    isPlaying
    positionMs
    positionUpdatedAt
    repeatMode
    shuffleMode
    volume
  }
}
`;

const client = generateClient();

export const fetchCloudState = async (): Promise<CloudState | null> => {
  try {
    const response = await client.graphql({
      query: GET_CLOUDSTATE,
    });

    // @ts-expect-error - Amplify types are sometimes tricky with generated types
    const data = response.data as { cloudState: CloudState };
    return data.cloudState;
  } catch (error) {
    console.error("Error fetching cloud state:", error);

    return null;
  }
};

