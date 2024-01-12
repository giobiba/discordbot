import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice'; // , createAudioResource
import { EmbedBuilder } from 'discord.js';
import { joinVC } from '@utils/voice_utils';
import { processUrl, searchYouTube } from '@src/utils/link_utils';
// import ytdl from 'ytdl-core';
import { UrlItem, YouTubeSearchResultItem } from '@src/typing';

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

        if (!getVoiceConnection(interaction.guild.id)) {
            if (interaction.member.voice.channel) {
                joinVC(interaction.member.voice.channel);
            }
            else {
                interaction.reply('You are not connected to a voice channel');
                return;
            }
        }
        // let url = interaction.options.getString('query');
        // if (!url) {
        //     url = 'https://www.youtube.com/watch?v=BokbpfhV8O8';
        // }

        // const stream = ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });

        // global.resource = createAudioResource(stream);
        // global.player.play(global.resource);

        await interaction.reply('Placeholder for playing');
    },
};
