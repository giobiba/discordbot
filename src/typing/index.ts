import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface CommandObject {
    data: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<void>,
}

export enum UrlTypes {
    YouTube = 'yt_vid',
    YouTubePlaylist = 'yt_list',
}

// Interface to match <platform, id>
export interface UrlItem {
    source: UrlTypes | null;
    id: string | null;
}

export interface YouTubePlaylistItem {
    snippet: {
        // Other snippet details can be included here
        resourceId: {
            videoId: string; // The unique ID of the video
        };
    };
}

export interface YouTubeSearchResultItem {
    id: {
        kind: string;
        videoId: string;
    };
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
            high: {
                url: string;
            };
        };
        channelTitle: string;
    };
    contentDetails: {
        duration: string;
    };
}

export interface Track {
    title: string;
    duration: string; // ISO 8601 duration format
    link: string;
    thumbnail: string;
    author: string;
    source: string; // YouTube
}
