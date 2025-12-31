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

export type Album = {
  __typename?: 'Album';
  artist: ArtistPreview;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isBookmarked: Scalars['Boolean']['output'];
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
  imageUrl?: Maybe<Scalars['String']['output']>;
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
  imageUrl?: Maybe<Scalars['String']['output']>;
  isBookmarked: Scalars['Boolean']['output'];
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
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type BookmarkAddInput = {
  items?: InputMaybe<Array<BookmarkItemInput>>;
};

export type BookmarkConnection = {
  __typename?: 'BookmarkConnection';
  edges?: Maybe<Array<BookmarkEdge>>;
  pageInfo: PageInfo;
};

export type BookmarkEdge = {
  __typename?: 'BookmarkEdge';
  cursor: Scalars['String']['output'];
  node: BookmarkItem;
};

export type BookmarkInput = {
  after?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type BookmarkItem = AlbumPreview | ArtistPreview | PlaylistPreview | SongPreview;

export type BookmarkItemInput = {
  artistId?: InputMaybe<Scalars['ID']['input']>;
  itemId: Scalars['ID']['input'];
  itemType: ContextType;
};

export type BookmarkRemoveInput = {
  items?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type BookmarkResponse = {
  __typename?: 'BookmarkResponse';
  bookmarks: BookmarkConnection;
};

export type ContextType =
  | 'ALBUM'
  | 'ARTIST'
  | 'PLAYLIST'
  | 'SONG';

export type CreateAlbumResponse = {
  __typename?: 'CreateAlbumResponse';
  album: Album;
  fields: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
};

export type CreateArtistResponse = {
  __typename?: 'CreateArtistResponse';
  artist: Artist;
  fields: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
};

export type CreatePlaylistResponse = {
  __typename?: 'CreatePlaylistResponse';
  fields: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  playlist: Playlist;
};

export type Mutation = {
  __typename?: 'Mutation';
  albumCreate: CreateAlbumResponse;
  artistCreate: CreateArtistResponse;
  bookmarkAdd: Scalars['Boolean']['output'];
  bookmarkRemove: Scalars['Boolean']['output'];
  playlistAddSong: PlaylistAddSongResult;
  playlistCreate: CreatePlaylistResponse;
  playlistRemoveSong: PlaylistRemoveSongResult;
  /** Get S3 upload URL to upload mp3 file into bucket */
  songPlay: Scalars['String']['output'];
  songUpload: SongUploadResponse;
};


export type MutationAlbumCreateArgs = {
  artistId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationArtistCreateArgs = {
  name: Scalars['String']['input'];
};


export type MutationBookmarkAddArgs = {
  input: BookmarkAddInput;
};


export type MutationBookmarkRemoveArgs = {
  input: BookmarkRemoveInput;
};


export type MutationPlaylistAddSongArgs = {
  input: PlaylistAddSongInput;
};


export type MutationPlaylistCreateArgs = {
  name: Scalars['String']['input'];
};


export type MutationPlaylistRemoveSongArgs = {
  input?: InputMaybe<PlaylistRemoveSongInput>;
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
  imageUrl?: Maybe<Scalars['String']['output']>;
  isBookmarked: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  songs: SongConnection;
  visibility: PlaylistVisibility;
};


export type PlaylistSongsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type PlaylistAddSongInput = {
  playlistId: Scalars['ID']['input'];
  songs?: InputMaybe<Array<SongInput>>;
};

export type PlaylistAddSongResult = {
  __typename?: 'PlaylistAddSongResult';
  playlistId: Scalars['ID']['output'];
  songsIds?: Maybe<Array<Scalars['ID']['output']>>;
};

export type PlaylistPreview = {
  __typename?: 'PlaylistPreview';
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type PlaylistRemoveSongInput = {
  playlistId: Scalars['ID']['input'];
  songsIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type PlaylistRemoveSongResult = {
  __typename?: 'PlaylistRemoveSongResult';
  playlistId: Scalars['ID']['output'];
  songsIds?: Maybe<Array<Scalars['ID']['output']>>;
};

export type PlaylistVisibility =
  | 'PRIVATE'
  | 'PUBLIC';

export type Query = {
  __typename?: 'Query';
  album: Album;
  artist: Artist;
  bookmarks: BookmarkConnection;
  playlist: Playlist;
  recentPlayed: Array<RecentPlayedItem>;
  search?: Maybe<SearchResponse>;
  song: Song;
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


export type QuerySearchArgs = {
  input: SearchInput;
};


export type QuerySongArgs = {
  artistId: Scalars['ID']['input'];
  songId: Scalars['ID']['input'];
};

export type RecentPlayedItem = AlbumPreview | ArtistPreview | PlaylistPreview | SongPreview;

export type SearchInput = {
  query: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type SearchResponse = {
  __typename?: 'SearchResponse';
  items: Array<BookmarkItem>;
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

export type SongInput = {
  artistId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
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

export type SongUploadResponse = {
  __typename?: 'SongUploadResponse';
  uploadUrl: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
};

export type BookmarkAddMutationVariables = Exact<{
  input: BookmarkAddInput;
}>;


export type BookmarkAddMutation = { __typename?: 'Mutation', bookmarkAdd: boolean };

export type BookmarkRemoveMutationVariables = Exact<{
  input: BookmarkRemoveInput;
}>;


export type BookmarkRemoveMutation = { __typename?: 'Mutation', bookmarkRemove: boolean };

export type CreateAlbumMutationVariables = Exact<{
  name: Scalars['String']['input'];
  artistId: Scalars['ID']['input'];
}>;


export type CreateAlbumMutation = { __typename?: 'Mutation', albumCreate: { __typename?: 'CreateAlbumResponse', imageUrl: string, fields: string, album: { __typename?: 'Album', id: string, artist: { __typename?: 'ArtistPreview', id: string } } } };

export type CreateArtistMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateArtistMutation = { __typename?: 'Mutation', artistCreate: { __typename?: 'CreateArtistResponse', imageUrl: string, fields: string, artist: { __typename?: 'Artist', id: string } } };

export type CreatePlaylistMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreatePlaylistMutation = { __typename?: 'Mutation', playlistCreate: { __typename?: 'CreatePlaylistResponse', imageUrl: string, fields: string, playlist: { __typename?: 'Playlist', id: string, name: string } } };

export type SongUploadMutationVariables = Exact<{
  input: SongUploadInput;
}>;


export type SongUploadMutation = { __typename?: 'Mutation', songUpload: { __typename?: 'SongUploadResponse', uploadUrl: string } };

export type SongPlayMutationVariables = Exact<{
  input: SongPlayInput;
}>;


export type SongPlayMutation = { __typename?: 'Mutation', songPlay: string };

export type GetAlbumQueryVariables = Exact<{
  input: AlbumQueryInput;
}>;


export type GetAlbumQuery = { __typename?: 'Query', album: { __typename?: 'Album', id: string, name: string, imageUrl?: string | null, isBookmarked: boolean, artist: { __typename?: 'ArtistPreview', id: string, name: string }, songs: { __typename?: 'SongConnection', edges: Array<{ __typename?: 'SongEdge', node: { __typename?: 'Song', id: string, title: string, duration?: number | null, artist: { __typename?: 'ArtistPreview', id: string, name: string, imageUrl?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } } };

export type GetArtistQueryVariables = Exact<{
  artistId: Scalars['ID']['input'];
}>;


export type GetArtistQuery = { __typename?: 'Query', artist: { __typename?: 'Artist', id: string, name: string, imageUrl?: string | null, albums: { __typename?: 'AlbumConnection', edges: Array<{ __typename?: 'AlbumEdge', node: { __typename?: 'AlbumPreview', id: string, name: string, imageUrl?: string | null } }> } } };

export type GetBookmarksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBookmarksQuery = { __typename?: 'Query', bookmarks: { __typename?: 'BookmarkConnection', edges?: Array<{ __typename?: 'BookmarkEdge', node:
        | { __typename: 'AlbumPreview', id: string, name: string, artist: { __typename?: 'ArtistPreview', id: string } }
        | { __typename: 'ArtistPreview' }
        | { __typename: 'PlaylistPreview', id: string, name: string, imageUrl?: string | null }
        | { __typename: 'SongPreview' }
       }> | null } };

export type GetSongQueryVariables = Exact<{
  songId: Scalars['ID']['input'];
  artistId: Scalars['ID']['input'];
}>;


export type GetSongQuery = { __typename?: 'Query', song: { __typename?: 'Song', id: string, title: string, duration?: number | null, artist: { __typename?: 'ArtistPreview', id: string, name: string } } };

export type GetPlaylistQueryVariables = Exact<{
  playlistId: Scalars['ID']['input'];
}>;


export type GetPlaylistQuery = { __typename?: 'Query', playlist: { __typename?: 'Playlist', id: string, name: string, imageUrl?: string | null, isBookmarked: boolean, songs: { __typename?: 'SongConnection', edges: Array<{ __typename?: 'SongEdge', node: { __typename?: 'Song', id: string, title: string, duration?: number | null, artist: { __typename?: 'ArtistPreview', id: string, name: string } } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } } } };

export type GetRecentlyPlayedQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecentlyPlayedQuery = { __typename?: 'Query', recentPlayed: Array<
    | { __typename: 'AlbumPreview', id: string, imageUrl?: string | null, name: string, artist: { __typename?: 'ArtistPreview', id: string, imageUrl?: string | null } }
    | { __typename: 'ArtistPreview', id: string, name: string, imageUrl?: string | null }
    | { __typename: 'PlaylistPreview', id: string, name: string }
    | { __typename: 'SongPreview', id: string, artistId: string, title: string }
  > };
