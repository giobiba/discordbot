import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface CommandObject {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<void>,
}

export enum UrlTypes {
    YouTubeVideo = 'youtube#video',
    YouTubePlaylist = 'youtube#playlist',
}

export enum Sources {
    Youtube = 'youtube',
}

// Interface to match <platform, id>
export interface UrlItem {
    source: UrlTypes;
    id: string;
}

export interface SearchItem extends UrlItem {
    title?: string;
}

export interface YouTubeSearchResultItem {
    id: {
        kind: string;
        videoId: string | undefined;
        playlistId: string | undefined;
    }
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            [key: string]: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
    };
}

export interface YouTubeSearchResponse {
    items: YouTubeSearchResultItem[];
}

export interface YoutubeVideoContentResponse {
    items: YouTubeVideoItem[];
}

export interface YouTubeVideoItem {
    snippet: {
        title: string;
        thumbnails: {
            [key: string]: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        description: string;
    };
    contentDetails: {
        duration: string;
    };
}

export interface YouTubePlaylist {
    snippet: {
        title: string;
        thumbnails: {
            [key: string]: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        description: string;
    },
    contentDetails: {
        itemCount: number;
    }
}

export interface YoutubePlaylistItems {
    nextPageToken?: string
    items: YoutubePlaylistItem[]
}

export interface YoutubePlaylistItem {
    snippet: {
        title: string;
        thumbnails: {
            [key: string]: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        description: string;
        playlistId: string;
    },
    contentDetails: {
        videoId: string;
    }
}

export interface Track {
    title: string;
    duration: string; // ISO 8601 duration format
    url: string;
    description: string;
    thumbnail: string;
    author: string;
    source: Sources;
    playlistId?: string;
}

export interface Playlist {
    tracks: Track[];
    title: string;
    url: string;
    description: string;
    thumbnail: string;
    author: string;
    source: Sources;
    count: number
}

export type Playable = Track | Playlist;
