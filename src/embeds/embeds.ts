import { Track, SearchItem } from '@src/typing';
import { convertDuration } from '@src/utils/conversionUtils';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

function playingEmbed(track: Track) {
    const playEmbed: EmbedBuilder = new EmbedBuilder()
        .setTitle(track.title).setURL(track.url)
        .setAuthor({ name: track.author })
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: 'Duration', value: convertDuration(track.duration), inline: true },
        )
        .setTimestamp()
        .setColor('#9867C5');
    return playEmbed;
}

function searchResultsEmbed(searchResultsOfQuery: SearchItem[]) {
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

function didNotRespond() {
    return { content: 'You did not repond... 😔', embeds: [], components: [] };
}

export { playingEmbed, searchResultsEmbed, didNotRespond };
