const axios = require('axios');
const { ytApiId } = require('../config.json');

// regex list with all compatible
const sourceRegexList = {
    YouTube: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    YouTubePlaylist: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
};

// matches url against regex
function identifyUrlType(url) {
    for (const source in sourceRegexList) {
        const regex = sourceRegexList[source];
        const match = url.match(regex);
        if (match) {
            return { source, id: match[1] };
        }
    }
    return { source: null, id: null };
}

// converts yt playlist to a list of (YouTube, <url>)
async function getYtItemsFromPlaylist(playlistId) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=100&key=${ytApiId}`;
    try {
        const response = await axios.get(url);
        const videoIds = response.data.items.map(item => ({ source: 'YouTube', id: item.snippet.resourceId.videoId }));
        return videoIds;
    }
    catch (error) {
        console.error('Error fetching playlist items:', error);
        return [];
    }
}

async function processUrl(url) {
    const { source, id } = identifyUrlType(url);

    if (source === 'YouTubePlaylist') {
        const videoIds = await getYtItemsFromPlaylist(id, ytApiId);
        return videoIds;
    }
    else if (source) {
        return [{ source, id }];
    }
    return [];
}

// retrieve top searches from a query on yt
async function searchYouTube(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${ytApiId}&maxResults=5`;

    try {
        const response = await axios.get(url);
        return response.data.items;
    }
    catch (error) {
        console.error('Error fetching data from YouTube:', error);
        return [];
    }
}

module.exports = {
    processUrl,
    searchYouTube,
};