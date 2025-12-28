import { generateClient, type GraphQLResult } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useState } from "react";
import type { Playlist } from "../types";

const CREATE_PLAYLIST = gql`
  mutation CreatePlaylist($name: String!) {
    playlistCreate(name: $name) {
      playlist {
        id
        name
      }
      imageUrl
      fields
    }
  }
`;

const client = generateClient();

interface CreatePlaylistParams {
    name: string;
    file?: File;
}

type CreatePlaylistResponse = {
    playlistCreate: {
        playlist: Playlist;
        imageUrl: string;
        fields: string;
    };
};

export const useCreatePlaylist = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPlaylist = async ({ name, file }: CreatePlaylistParams) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await client.graphql({
                query: CREATE_PLAYLIST,
                variables: { name },
            }) as GraphQLResult<CreatePlaylistResponse>;

            const { playlist, imageUrl, fields } = response.data.playlistCreate;

            if (file && imageUrl && fields) {
                const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
                await uploadToS3(imageUrl, parsedFields, file);
            }

            return playlist;
        } catch (err: unknown) {
            console.error("Create Playlist Error:", err);
            setError((err as Error).message || "Failed to create playlist");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createPlaylist, isLoading, error };
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
