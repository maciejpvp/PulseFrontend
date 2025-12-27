import { generateClient, type GraphQLResult } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useState } from "react";
import type { Artist } from "../types";

const CREATE_ARTIST = gql`
  mutation CreateArtist($name: String!) {
    artistCreate(name: $name) {
      profilePictureURL
      fields # Stringified JSON from backend 
    }
  }
`;

const client = generateClient();

interface CreateArtistParams {
    name: string;
    file?: File;
}

type CreateArtistResponse = {
    artistCreate: {
        artist: Artist;
        profilePictureURL: string;
        fields: string;
    };
};

export const useCreateArtist = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createArtist = async ({ name, file }: CreateArtistParams) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await client.graphql({
                query: CREATE_ARTIST,
                variables: { name },
            }) as GraphQLResult<CreateArtistResponse>;

            const { artist, profilePictureURL, fields } = response.data.artistCreate;

            // If picture is provided, upload it to S3
            if (file && profilePictureURL && fields) {
                console.log(JSON.parse(fields))
                const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;

                await uploadToS3(profilePictureURL, parsedFields, file);
            }

            return artist as Artist;
        } catch (err: unknown) {
            console.error("Create Artist Error:", err);
            setError((err as Error).message || "Failed to create artist");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createArtist, isLoading, error };
};

async function uploadToS3(url: string, fields: Record<string, string>, file: File) {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        const s3Key = key.replace(/_/g, "-");
        formData.append(s3Key, value);
    });
    formData.append("Content-Type", file.type);
    formData.append("file", file);

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorXml = await response.text();
        console.error("S3 Upload Error XML:", errorXml);
        throw new Error("Failed to upload image to S3");
    }
}