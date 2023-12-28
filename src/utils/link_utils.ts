import axios from 'axios';
import { ytApiId } from '@config/config.json';
import { UrlTypes, UrlItem, YouTubePlaylistItem, YouTubeSearchResultItem, YouTubeSearchResponse} from '@typing';

// Regex list with all compatible platforms
const sourceRegexList: Record<UrlTypes, RegExp> = {
    [UrlTypes.YouTube]: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    [UrlTypes.YouTubePlaylist]: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
};

// Matches URL against regex
function identifyUrlType(url: string): UrlItem {
    for (const source in sourceRegexList) {
        if (Object.hasOwnProperty.call(sourceRegexList, source)) {
            const regex = sourceRegexList[source as UrlTypes];
            const match = url.match(regex);
            if (match) {
                return { source: source as UrlTypes, id: match[1] };
            }
        }
    }
    return { source: null, id: null };
}

// Converts YouTube playlist to a list of YouTube video items
async function getYtItemsFromPlaylist(playlistId: string): Promise<UrlItem[]> {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=100&key=${ytApiId}`;
    try {
        const response = await axios.get(url);
        const videoIds = response.data.items.map((item: YouTubePlaylistItem) => ({ source: UrlTypes.YouTube, id: item.snippet.resourceId.videoId }));
        return videoIds;
    } catch (error) {
        console.error('Error fetching playlist items:', error);
        return [];
    }
}

// Processes a URL and returns a list of YouTube video items
async function processUrl(url: string): Promise<UrlItem[]> {
    const { source, id } = identifyUrlType(url);
    switch (source) {
    case null: return [];
    case UrlTypes.YouTubePlaylist:
        return getYtItemsFromPlaylist(id!);
    default: return [{ source, id: id! }];
    }
}

// Retrieves top searches from a query on YouTube
async function searchYouTube(query: string): Promise<YouTubeSearchResultItem[]> {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${ytApiId}&maxResults=5`;
    try {
        const response = await axios.get<YouTubeSearchResponse>(url);
        return response.data.items;
    } catch (error) {
        console.error('Error fetching data from YouTube:', error);
        return [];
    }
}

export { processUrl, searchYouTube };
