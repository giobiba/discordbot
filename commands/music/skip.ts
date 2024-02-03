import { SlashCommandBuilder } from '@discordjs/builders';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip song'),
    async execute(interaction) {
        const player = Player.getInstance();
        player.handleSkip(interaction).then((msg) => {
            setTimeout(() => msg.delete(), 10_000);
        }).catch();
    },
};
