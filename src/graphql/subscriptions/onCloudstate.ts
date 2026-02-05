import { generateClient, type GraphQLResult } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useEffect } from "react";
import type { CloudState } from "../types";

export const ON_CLOUDSTATE_UPDATE = gql`
subscription OnCloudStateUpdate {
  onCloudState {
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

interface OnCloudStateSubscription {
    onCloudState?: CloudState | null;
}

interface UseOnCloudstateUpdateOptions {
    onData?: (state: CloudState) => void;
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

export const useOnCloudstateUpdate = (options: UseOnCloudstateUpdateOptions = {}) => {
    const { onData, onError, enabled = true } = options;

    useEffect(() => {
        console.log("[useOnCloudstateUpdate] Enabled:", enabled);
        if (!enabled) return;

        const subscription = (client.graphql<OnCloudStateSubscription>({
            query: ON_CLOUDSTATE_UPDATE,
        }) as unknown as Observable<GraphQLResult<OnCloudStateSubscription>>).subscribe({
            next: (result: GraphQLResult<OnCloudStateSubscription>) => {
                const data = result.data;
                if (data?.onCloudState) {
                    onData?.(data.onCloudState);
                }
            },
            error: (err) => {
                console.error("[useOnCloudstateUpdate] Error:", err);
                onError?.(err);
            },
            complete: () => {
                console.debug("[useOnCloudstateUpdate] Completed.");
            },
        });

        return () => subscription.unsubscribe();
    }, [onData, onError, enabled]);
};

