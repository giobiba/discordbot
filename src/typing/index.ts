import { SlashCommandBuilder } from '@discordjs/builders';

export interface CommandObject {
    data: SlashCommandBuilder,
    execute: (interaction: any) => Promise<unknown>,
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
