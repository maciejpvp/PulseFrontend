import { Amplify } from "aws-amplify";

Amplify.configure({
    API: {
        GraphQL: {
            endpoint: import.meta.env.VITE_APPSYNC_URL,
            region: "eu-central-1",
            defaultAuthMode: "userPool",
        },
    },
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_USER_POOL_ID,
            userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
        },
    },
});
