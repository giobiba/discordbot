import { SlashCommandBuilder } from '@discordjs/builders';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Clear the bot queue and skip current song'),
    async execute(interaction) {
        const player = Player.getInstance();
        player.handleStop(interaction).then((msg) => {
            setTimeout(() => msg.delete(), 10_000);
        }).catch();
    },
};
