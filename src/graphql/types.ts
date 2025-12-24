export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddToPlaylistResult = {
  __typename?: 'AddToPlaylistResult';
  playlistId: Scalars['ID']['output'];
  songId: Scalars['ID']['output'];
};

export type Album = {
  __typename?: 'Album';
  artist: ArtistPreview;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  songs: SongConnection;
};


export type AlbumSongsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type AlbumConnection = {
  __typename?: 'AlbumConnection';
  edges: Array<AlbumEdge>;
  pageInfo: PageInfo;
};

export type AlbumEdge = {
  __typename?: 'AlbumEdge';
  cursor: Scalars['String']['output'];
  node: AlbumPreview;
};

export type AlbumPreview = {
  __typename?: 'AlbumPreview';
  artist: ArtistPreview;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AlbumQueryInput = {
  albumId: Scalars['String']['input'];
  artistId: Scalars['String']['input'];
};

export type Artist = {
  __typename?: 'Artist';
  albums: AlbumConnection;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  songs: SongConnection;
};


export type ArtistAlbumsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type ArtistSongsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type ArtistPreview = {
  __typename?: 'ArtistPreview';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ContextType =
  | 'ALBUM'
  | 'ARTIST'
  | 'PLAYLIST'
  | 'SONG';

export type Mutation = {
  __typename?: 'Mutation';
  albumCreate: Album;
  artistCreate: Artist;
  playlistAddToPlaylist: AddToPlaylistResult;
  playlistCreate: Playlist;
  playlistRemoveFromPlaylist: RemoveFromPlaylistResult;
  /** Get S3 upload URL to upload mp3 file into bucket */
  songPlay: Scalars['String']['output'];
  songUpload: UploadUrlResponse;
};


export type MutationAlbumCreateArgs = {
  artistId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationArtistCreateArgs = {
  name: Scalars['String']['input'];
};


export type MutationPlaylistAddToPlaylistArgs = {
  playlistId: Scalars['ID']['input'];
  songArtistId: Scalars['ID']['input'];
  songId: Scalars['ID']['input'];
};


export type MutationPlaylistCreateArgs = {
  name: Scalars['String']['input'];
};


export type MutationPlaylistRemoveFromPlaylistArgs = {
  playlistId: Scalars['ID']['input'];
  songId: Scalars['ID']['input'];
};


export type MutationSongPlayArgs = {
  input: SongPlayInput;
};


export type MutationSongUploadArgs = {
  input: SongUploadInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Playlist = {
  __typename?: 'Playlist';
  createdAt: Scalars['String']['output'];
  creator: User;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  songs: SongConnection;
  visibility: PlaylistVisibility;
};


export type PlaylistSongsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type PlaylistPreview = {
  __typename?: 'PlaylistPreview';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type PlaylistVisibility =
  | 'PRIVATE'
  | 'PUBLIC';

export type Query = {
  __typename?: 'Query';
  album: Album;
  artist: Artist;
  playlist: Playlist;
  recentPlayed: Array<RecentPlayedItem>;
};


export type QueryAlbumArgs = {
  input: AlbumQueryInput;
};


export type QueryArtistArgs = {
  artistId: Scalars['ID']['input'];
};


export type QueryPlaylistArgs = {
  playlistId: Scalars['ID']['input'];
};

export type RecentPlayedItem = AlbumPreview | ArtistPreview | PlaylistPreview | SongPreview;

export type RemoveFromPlaylistResult = {
  __typename?: 'RemoveFromPlaylistResult';
  playlistId: Scalars['ID']['output'];
  removed: Scalars['Boolean']['output'];
  songId: Scalars['ID']['output'];
};

export type Song = {
  __typename?: 'Song';
  artist: ArtistPreview;
  duration?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type SongConnection = {
  __typename?: 'SongConnection';
  edges: Array<SongEdge>;
  pageInfo: PageInfo;
};

export type SongEdge = {
  __typename?: 'SongEdge';
  cursor: Scalars['String']['output'];
  node: Song;
};

export type SongPlayInput = {
  artistId: Scalars['String']['input'];
  contextId: Scalars['String']['input'];
  contextType: ContextType;
  songId: Scalars['String']['input'];
};

export type SongPreview = {
  __typename?: 'SongPreview';
  artistId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type SongUploadInput = {
  albumId?: InputMaybe<Scalars['ID']['input']>;
  artistId: Scalars['ID']['input'];
  duration: Scalars['Int']['input'];
  songTitle: Scalars['String']['input'];
};

export type UploadUrlResponse = {
  __typename?: 'UploadUrlResponse';
  uploadUrl: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
};

export type GetAlbumQueryVariables = Exact<{
  input: AlbumQueryInput;
}>;


export type GetAlbumQuery = { __typename?: 'Query', album: { __typename?: 'Album', id: string, name: string, artist: { __typename?: 'ArtistPreview', id: string, name: string }, songs: { __typename?: 'SongConnection', edges: Array<{ __typename?: 'SongEdge', node: { __typename?: 'Song', id: string, title: string, duration?: number | null } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } } };

export type GetArtistQueryVariables = Exact<{
  artistId: Scalars['ID']['input'];
}>;


export type GetArtistQuery = { __typename?: 'Query', artist: { __typename?: 'Artist', id: string, name: string, albums: { __typename?: 'AlbumConnection', edges: Array<{ __typename?: 'AlbumEdge', node: { __typename?: 'AlbumPreview', id: string, name: string } }> }, songs: { __typename?: 'SongConnection', edges: Array<{ __typename?: 'SongEdge', node: { __typename?: 'Song', id: string, title: string, duration?: number | null, artist: { __typename?: 'ArtistPreview', id: string, name: string } } }> } } };

export type GetRecentlyPlayedQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecentlyPlayedQuery = { __typename?: 'Query', recentPlayed: Array<
    | { __typename: 'AlbumPreview', id: string, name: string, artist: { __typename?: 'ArtistPreview', id: string } }
    | { __typename: 'ArtistPreview', id: string, name: string }
    | { __typename: 'PlaylistPreview', id: string, name: string }
    | { __typename: 'SongPreview', id: string, artistId: string, title: string }
  > };
