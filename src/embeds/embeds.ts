import { Track, SearchItem, Playable } from '@src/typing';
import { convertDuration } from '@src/utils/conversionUtils';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export function playingEmbed(track: Track) {
    const playEmbed: EmbedBuilder = new EmbedBuilder()
        .setTitle(track.title).setURL(track.url)
        .setAuthor({ name: track.author })
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: 'Duration', value: convertDuration(track.duration), inline: true },
        )
        .setTimestamp()
        .setColor('#9867C5');
    return {
        embeds: [playEmbed],
    };
}

export function searchResultsEmbed(searchResultsOfQuery: SearchItem[]) {
    const searchResultsEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor('#9867C5')
        .setTitle('Search Results:');

    let counter = 1;
    const results = searchResultsOfQuery.map((searchResult) => ({ name: '\u200B', value: `${counter++}. ${searchResult.title}` }));

    counter = 1;
    const buttons = searchResultsOfQuery.map((searchResult) => new ButtonBuilder()
        .setCustomId(`${searchResult.id}`)
        .setLabel(`Video ${counter++}`)
        .setStyle(ButtonStyle.Secondary));

    return {
        embeds: [searchResultsEmbed.addFields(results)],
        components: [new ActionRowBuilder().addComponents(buttons)],
    };
}

export function addedToQueue(playable: Playable) {
    return { content: `Added ${playable.title} to queue` };
}

export function didNotRespond() {
    return { content: 'You did not repond... 😔' };
}

export function memberNotConnected(ephemeral: boolean) {
    return { content: 'You are not connected to a Voice Channel', ephemeral: ephemeral };
}

export function alreadyConnected(ephemeral: boolean) {
    return { content: 'Already in your voice channel', ephemeral: ephemeral };
}

export function botNotConnected(ephemeral: boolean) {
    return { content: 'I am not connected to a voice channel', ephemeral: ephemeral };
}

export function noSongPlaying(ephemeral: boolean) {
    return { content: 'Not playing a song', ephemeral: ephemeral };
}

export function paused() {
    return { content: 'Paused' };
}

export function alreadyPaused() {
    return { content: 'Player is already paused' };
}

export function failedPause() {
    return { content: 'Failed to pause' };
}

export function resumed() {
    return { content: 'Resuming song' };
}

export function notPaused() {
    return { content: 'Player not paused' };
}

export function failedResume() {
    return { content: 'Failed to resume' };
}

export function disconnected() {
    return { content: 'Disconnected' };
}

export function skipped() {
    return { content: 'Skipped' };
}

export function skipFailed() {
    return { content: 'Failed to skip' };
}

export function stopped() {
    return { content: 'Skipped' };
}

export function stopFailed() {
    return { content: 'Failed to skip' };
}
