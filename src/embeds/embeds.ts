import { Track } from '@src/typing';
import { convertDuration } from '@src/utils/conversionUtils';
import { EmbedBuilder } from 'discord.js';

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

export { playingEmbed };
