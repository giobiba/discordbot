import { SlashCommandBuilder } from '@discordjs/builders';
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
        const query: string = interaction.options.getString('query');

        const player: Player = Player.getInstance();
        const item = await player.search(query, interaction);

        if (!item) return;

        player.play(item, interaction);
    },
};
