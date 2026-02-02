import { useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getDevicePingInput } from '../lib/getDevicePingInput';
import { gql } from 'graphql-tag';

const client = generateClient();
const FIVE_MINUTES = 5 * 60 * 1000;

const devicePing = gql`
  mutation DevicePing($input: DevicePingInput!) {
    devicePing(input: $input)
  }
`;

export const useDeviceHeartbeat = () => {
    useEffect(() => {
        const performPing = async () => {
            try {
                const input = getDevicePingInput();

                await client.graphql({
                    query: devicePing,
                    variables: { input: input }
                });

                console.log('Device ping successful');
            } catch (error) {
                console.error('Error pinging device:', error);
            }
        };

        // Ping immediately on load
        performPing();

        // Set up the 5-minute interval
        const interval = setInterval(performPing, FIVE_MINUTES);

        return () => clearInterval(interval);
    }, []);
};