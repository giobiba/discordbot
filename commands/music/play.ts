import { SlashCommandBuilder } from '@discordjs/builders';
import { processUrl, searchYouTube, fetchYouTubeVideoDetails } from '@src/utils/linkUtils';
import { UrlItem, YouTubeSearchResultItem, Track } from '@src/typing';
import { Player } from '@src/player/player';
import { GuildQueue } from '@src/player/guildQueue';
import { didNotRespond, searchResultsEmbed } from '@src/embeds/embeds';

export = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song to the bot')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('name of the song/search query')
            .setRequired(true)),
    async execute(interaction) {
        const query: string = interaction.options.getString('query');
        const requestedUrlItems: UrlItem[] = await processUrl(query);

        let videoId: string = '';
        if (requestedUrlItems.length === 0) {
            const searchResultsOfQuery: YouTubeSearchResultItem[] = await searchYouTube(query);

            if (searchResultsOfQuery.length === 0) {
                return interaction.reply('Youtube did not yield any search results. Try again!');
            }

            const response = await interaction.reply(searchResultsEmbed(searchResultsOfQuery));

            await response.awaitMessageComponent({ time: 5_000 }).then((confirmation) => {
                videoId = confirmation.customId;
                response.delete();
            }).catch(() => {
                return interaction.editReply(didNotRespond()).then((msg) => {
                    setTimeout(() => msg.delete(), 5_000);
                }).catch();
            });
        }
        else {
            videoId = requestedUrlItems[0].id!;
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

        const track: Track = await fetchYouTubeVideoDetails(videoId);

        if (!guildQueue.currentTrack && guildQueue.isEmpty()) {
            guildQueue.queuePlayer.play(track);
        }
        else {
            guildQueue.tracks.enqueue(track);

            await interaction.reply('Added to queue');
        }
    },
};
