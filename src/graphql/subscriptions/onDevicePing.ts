import { generateClient, type GraphQLResult } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect } from "react";
import type { Device, OnDevicePingSubscription } from "../types";

export const ON_DEVICE_PING = gql`
  subscription OnDevicePing {
    onDevicePing {
      deviceId
      name
      type
    }
  }
`;

interface UseOnDevicePingOptions {
    onData?: (device: Device) => void;
    onError?: (error: unknown) => void;
    enabled?: boolean;
}

interface SubscriptionObserver<T> {
    next: (value: T) => void;
    error: (error: unknown) => void;
    complete: () => void;
}

interface Observable<T> {
    subscribe(observer: SubscriptionObserver<T>): { unsubscribe(): void };
}

const client = generateClient();

/**
 * Hook to subscribe to device pings.
 * Automatically unsubscribes on unmount or when disabled.
 */
export const useOnDevicePing = (options: UseOnDevicePingOptions = {}) => {
    const { onData, onError, enabled = true } = options;

    useEffect(() => {
        if (!enabled) return;

        const subscription = (client.graphql<OnDevicePingSubscription>({
            query: ON_DEVICE_PING,
        }) as unknown as Observable<GraphQLResult<OnDevicePingSubscription>>).subscribe({
            next: (result: GraphQLResult<OnDevicePingSubscription>) => {
                const data = result.data;
                if (data?.onDevicePing) {
                    onData?.(data.onDevicePing as Device);
                }
            },
            error: (err) => {
                console.error("[useOnDevicePing] Error:", err);
                onError?.(err);
            },
            complete: () => {
                console.debug("[useOnDevicePing] Completed.");
            },
        });

        return () => subscription.unsubscribe();
    }, [onData, onError, enabled]);
};
