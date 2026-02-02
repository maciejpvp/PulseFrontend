import { create } from "zustand"
import { generateClient } from "aws-amplify/api"
import { gql } from "graphql-tag"
import type { Device } from "@/graphql/types"

const GET_DEVICES = gql`
  query GetDevices {
    devices {
      deviceId
      name
      type
    }
  }
`;

const client = generateClient();

type CloudState = {
    primeDeviceId: string
    trackId: string
    devices: Device[]
    setPrimeDeviceId: (id: string) => void
    setTrackId: (id: string) => void
    setDevices: (devices: Device[]) => void
    fetchDevices: () => Promise<void>
}

export const useCloudStateStore = create<CloudState>((set) => ({
    primeDeviceId: "",
    trackId: "",
    devices: [],
    setPrimeDeviceId: (id: string) => set({ primeDeviceId: id }),
    setTrackId: (id: string) => set({ trackId: id }),
    setDevices: (devices) => set({ devices }),
    fetchDevices: async () => {
        try {
            const response = await client.graphql({
                query: GET_DEVICES,
            });
            // @ts-expect-error - Handling Amplify's generic response type
            const data = response.data as { devices: Device[] };
            if (data?.devices) {
                set({ devices: data.devices });
            }
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    },
}));

// Initialize store by fetching devices
useCloudStateStore.getState().fetchDevices();
