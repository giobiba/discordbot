import axios from 'axios';
import { ytApiId } from '@config/config.json';
import { UrlTypes, SearchItem, UrlItem,
    YouTubeSearchResponse, YoutubeVideoContentResponse,
    YouTubeVideoItem, Track, Playlist, Playable, Sources,
    YouTubePlaylist, YoutubePlaylistItems, YoutubePlaylistItem } from '@typing';
import { decode } from 'html-entities';

// Regex list with all compatible platforms
const sourceRegexList: Record<UrlTypes, RegExp> = {
    [UrlTypes.YouTubeVideo]: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    [UrlTypes.YouTubePlaylist]: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
};

// Matches URL against regex
function identifyUrlType(url: string): UrlItem | null {
    for (const source in sourceRegexList) {
        if (Object.hasOwnProperty.call(sourceRegexList, source)) {
            const regex = sourceRegexList[source as UrlTypes];
            const match = url.match(regex);
            if (match) {
                return { source: source as UrlTypes, id: match[1] };
            }
        }
    }
    return null;
}

// Retrieves top searches from a query on YouTube
async function searchYouTube(query: string): Promise<SearchItem[]> {
    const url: string = 'https://www.googleapis.com/youtube/v3/search?';
    try {
        const response = await axios.get<YouTubeSearchResponse>(url, { params: {
            key: ytApiId,
            q: encodeURIComponent(query),
            part: 'snippet',
            type: 'video,playlist',
        } });

        const items = response.data.items.map((item) => ({
            source: item.id.kind as UrlTypes,
            id: (item.id.videoId || item.id.playlistId)!,
            title: decode(item.snippet.title),
        } as SearchItem));

        return items;
    }
    catch (error) {
        console.error('Error fetching data from YouTube:', error);
        return [];
    }
}

async function fetchYouTube(searchItem: SearchItem): Promise<Playable> {
    switch (searchItem.source) {
    case UrlTypes.YouTubeVideo:
        return fetchYouTubeVideoDetails(searchItem);
    case UrlTypes.YouTubePlaylist:
        return fetchYouTubePlaylistDetails(searchItem);
    }
}


async function fetchYouTubeVideoDetails(searchItem: SearchItem): Promise<Track> {
    if (searchItem.source != UrlTypes.YouTubeVideo) throw Error('Not a youtube video');

    const url: string = 'https://www.googleapis.com/youtube/v3/videos';
    const response = await axios.get<YoutubeVideoContentResponse>(url, { params: {
        id: searchItem.id,
        key: ytApiId,
        part: 'snippet,contentDetails',
    } });

    const res = response.data.items[0];
    if (!res) {
        throw new Error('Video not found');
    }

    const { snippet, contentDetails }: YouTubeVideoItem = res;
    const yturl = `https://www.youtube.com/watch?v=${searchItem.id}`;

    return {
        title: decode(snippet.title),
        duration: contentDetails.duration,
        description: snippet.description,
        url: yturl,
        thumbnail: snippet.thumbnails.high.url,
        author: snippet.channelTitle,
    } as Track;
}

async function fetchYoutubePlaylistItems(searchItem: SearchItem): Promise<Track[]> {
    let url: string = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${searchItem.id}&key=${ytApiId}&part=snippet,contentDetails&maxResults=50`;
    let response = await axios.get<YoutubePlaylistItems>(url);

    let nextPageToken = response.data.nextPageToken;
    const items: YoutubePlaylistItem[] = [];
    while (nextPageToken) {
        items.push(...response.data.items);

        url = 'https://www.googleapis.com/youtube/v3/playlistItems';
        response = await axios.get<YoutubePlaylistItems>(url, { params: {
            playlistId: searchItem.id,
            key: ytApiId,
            part: 'snippet,contentDetails',
            maxResults: 50,
            pageToken: nextPageToken,
        } });
        nextPageToken = response.data.nextPageToken;
    }

    if (items.length === 0) throw Error('No videos found in playlist');

    const tracks: Track[] = await Promise.all(items.map(async (item) => {
        const { snippet, contentDetails }: YoutubePlaylistItem = item;

        const url: string = `https://www.googleapis.com/youtube/v3/videos?id=${item.contentDetails.videoId}&key=${ytApiId}&part=snippet,contentDetails`;
        const response = await axios.get<YoutubeVideoContentResponse>(url);

        const res = response.data.items[0];
        if (!res) {
            throw new Error('Video not found');
        }

        return {
            title: snippet.title,
            duration: res.contentDetails.duration,
            description: snippet.description,
            url: `https://www.youtube.com/watch?v=${contentDetails.videoId}&list=${snippet.playlistId}`,
            thumbnail: snippet.thumbnails.high.url,
            author: res.snippet.channelTitle,
            playlistId: snippet.playlistId,
            source: Sources.Youtube,
        } as Track;
    }));
    return tracks;
}

async function fetchYouTubePlaylistDetails(searchItem: SearchItem): Promise<Playlist> {
    if (searchItem.source != UrlTypes.YouTubePlaylist) throw Error('Not a youtube playlist');

    const url: string = `https://www.googleapis.com/youtube/v3/playlists?id=${searchItem.id}&key=${ytApiId}&part=snippet,contentDetails`;
    const response = await axios.get(url);

    const res = response.data.items[0];
    if (!res) {
        throw new Error('Playlist not found');
    }

    const { snippet, contentDetails }: YouTubePlaylist = res;
    const tracks: Track[] = await fetchYoutubePlaylistItems(searchItem);

    return {
        tracks: tracks,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high.url,
        author: snippet.channelTitle,
        source: Sources.Youtube,
        count: contentDetails.itemCount,
    } as Playlist;
}

export { searchYouTube, fetchYouTubeVideoDetails, identifyUrlType, fetchYouTubePlaylistDetails, fetchYouTube };
