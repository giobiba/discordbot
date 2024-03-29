import { SlashCommandBuilder } from '@discordjs/builders';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip song'),
    async execute(interaction) {
        const player = Player.getInstance();
        await player.handleSkip(interaction);
    },
};
