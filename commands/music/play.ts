import { SlashCommandBuilder } from '@discordjs/builders';
import { join } from '@utils/voiceUtils';
import { StreamDispatcher } from '@src/player/streamDispatcher';
import ytdl from 'ytdl-core';
import { EmbedBuilder } from 'discord.js';
import { processUrl, searchYouTube, fetchYouTubeVideoDetails } from '@src/utils/linkUtils';
import { UrlItem, YouTubeSearchResultItem, Track } from '@src/typing';
import { convertDuration } from '@src/utils/conversionUtils';

export = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song to the bot')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('name of the song/search query')
            .setRequired(false)),
    async execute(interaction) {
        const query: string = interaction.options.getString('query');
        const requestedUrlItems: UrlItem[] = await processUrl(query);
        if (requestedUrlItems.length === 0) {
            const searchResultsOfQuery: YouTubeSearchResultItem[] = await searchYouTube(query);
            if (searchResultsOfQuery.length === 0) {
                interaction.reply('Youtube did not yield any search results. Try again!');
                return;
            }
            const searchResultsEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor('#9867C5')
                .setTitle('Search Results:');

            let counter: number = 0;
            for (const searchResult of searchResultsOfQuery) {
                const title: string = searchResult.snippet.title;
                counter++;
                searchResultsEmbed.addFields({ name: '\u200B', value: `${counter}. ${title}` });
            }

            await interaction.reply({
                embeds: [searchResultsEmbed],
            });
            return;
        }

        if (!global.streamDispatcher) {
            if (interaction.member.voice.channel) {
                global.streamDispatcher = new StreamDispatcher(join(interaction.member.voice.channel), interaction.member.voice.channel);
            }
            else {
                interaction.reply('You are not connected to a voice channel');
                return;
            }
        }

        const track: Track = await fetchYouTubeVideoDetails(requestedUrlItems[0].id!);
        const playEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle(track.title).setURL(track.url)
            .setAuthor({ name: track.author })
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: convertDuration(track.duration), inline: true },
            )
            .setTimestamp()
            .setColor('#9867C5');

        global.streamDispatcher.createAudioResource(ytdl(track.url, { filter: 'audioonly', highWaterMark: 1 << 25 }));
        global.streamDispatcher.play();

        await interaction.reply({
            embeds: [playEmbed],
        });
    },
};
