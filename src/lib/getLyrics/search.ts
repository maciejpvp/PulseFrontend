const TOKEN = "IeujOBYt-ix7iL9FwW8tGkEtK08zfZZOLqKLa4Dmfahn9NeX3X2cwgSIq1U_lCO3";

/**
 * Searches for a song on Genius and returns the URL of the first result.
 * @param query The search query (e.g., "White2115 California")
 * @returns The URL of the first song found, or null if no results.
 */
export async function searchSong(query: string): Promise<string | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const geniusUrl = `https://api.genius.com/search?q=${encodedQuery}&access_token=${TOKEN}`;
    const url = `https://corsproxy.io/?${encodeURIComponent(geniusUrl)}`;

    const response = await fetch(url);
    const data = await response.json();

    const hits = data.response.hits;

    if (hits && hits.length > 0) {
      const topHit = hits[0].result;
      if (topHit.url) {
        return topHit.url;
      }
    }

    return null;
  } catch (error) {
    console.error('Error searching for song:', error);
    return null;
  }
}
