import { generateClient, type GraphQLResult } from "aws-amplify/api";
import { gql } from "graphql-tag";
import { useState } from "react";

const SONG_UPLOAD = gql`
  mutation SongUpload($input: SongUploadInput!) {
    songUpload(input: $input) {
      uploadUrl
    }
  }
`;

const client = generateClient();

interface SongUploadInput {
    songTitle: string;
    artistId: string;
    duration: number;
    albumId?: string;
}

interface CreateSongParams extends SongUploadInput {
    file: File;
}

type SongUploadResponse = {
    songUpload: {
        uploadUrl: string;
    };
};

export const useCreateSong = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSong = async ({ songTitle, artistId, duration, albumId, file }: CreateSongParams) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await client.graphql({
                query: SONG_UPLOAD,
                variables: {
                    input: {
                        songTitle,
                        artistId,
                        duration,
                        albumId: albumId || undefined,
                    },
                },
            }) as GraphQLResult<SongUploadResponse>;

            const { uploadUrl } = response.data.songUpload;

            if (file && uploadUrl) {
                await uploadToS3(uploadUrl, file);
            }

            return { success: true };
        } catch (err: unknown) {
            console.error("Create Song Error:", err);
            setError((err as Error).message || "Failed to create song");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createSong, isLoading, error };
};

async function uploadToS3(url: string, file: File) {
    const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("S3 Upload Error:", errorText);
        throw new Error("Failed to upload song to S3");
    }
}
