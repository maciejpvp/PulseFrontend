import * as cheerio from 'cheerio';

/**
 * Scrapes lyrics from a Genius song page URL.
 * @param url The Genius song URL.
 * @returns The extracted lyrics as a string, or null if failed.
 */
export async function scrapeLyrics(url: string): Promise<string | null> {
    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Genius uses specific data-lyrics-container attributes for lyrics
        let lyrics = '';

        $('[data-lyrics-container="true"]').each((_, element) => {
            // Replace <br> with newlines
            $(element).find('br').replaceWith('\n');
            lyrics += $(element).text() + '\n';
        });

        if (!lyrics) {
            // Fallback for older Genius layouts
            lyrics = $('.lyrics').text();
        }

        return lyrics.trim() || null;
    } catch (error) {
        console.error('Error scraping lyrics:', error);
        return null;
    }
}
