import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { processUrl, searchYouTube, fetchYouTubeVideoDetails } from '@src/utils/linkUtils';
import { UrlItem, YouTubeSearchResultItem, Track } from '@src/typing';
import { Player } from '@src/player/player';
import { GuildQueue } from '@src/player/guildQueue';

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

        const guildId = interaction.guildId;
        const player = Player.getInstance();
        const guildQueue: GuildQueue = player.guildQueueManager.create(guildId, interaction.channelId);

        if (interaction.member.voice.channel) {
            if (!guildQueue.isConnected() || interaction.member.voice.channelId !== guildQueue.channelId) {
                guildQueue.connect(interaction.member.voice.channel);
            }
        }
        else {
            await interaction.reply({ content: 'You are not connected to a voice channel!', ephemeral: true });
        }

        const track: Track = await fetchYouTubeVideoDetails(requestedUrlItems[0].id!);

        if (!guildQueue.currentTrack && guildQueue.isEmpty()) {
            guildQueue.queuePlayer.play(track);
        }
        else {
            guildQueue.tracks.enqueue(track);

            await interaction.reply('Added to queue');
        }
    },
};
