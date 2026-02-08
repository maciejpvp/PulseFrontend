export * from './search';
export * from './scraper';

import { searchSong } from './search';
import { scrapeLyrics } from './scraper';

/**
 * Fetches lyrics for a given song query.
 * @param query Search query for the song.
 * @returns Lyrics of the first match.
 */
export async function fetchLyrics(query: string): Promise<string | null> {
    const url = await searchSong(query);
    if (!url) return null;
    return await scrapeLyrics(url);
}
