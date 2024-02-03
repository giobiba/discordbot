import { SlashCommandBuilder } from '@discordjs/builders';
import { memberNotConnected } from '@src/embeds/embeds';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song to the bot')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('Search query')
            .setRequired(true)),
    async execute(interaction) {
        const vcId = interaction.member.voice.channelId;

        if (!vcId) {
            return await interaction.reply(memberNotConnected(true));
        }

        const query: string = interaction.options.getString('query');

        const player: Player = Player.getInstance();
        const item = await player.search(query, interaction);

        if (!item) return;

        player.play(item, interaction);
        interaction.deleteReply();
    },
};
