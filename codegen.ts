
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: "src/graphql/schema.generated.graphql",
    documents: "src/**/*.{ts,tsx}",
    ignoreNoDocuments: true,
    generates: {
        "src/graphql/types.ts": {
            plugins: ["typescript", "typescript-operations"],
            config: {
                enumsAsTypes: true
            }
        }
    }
};

export default config;
