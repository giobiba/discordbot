import { SlashCommandBuilder } from '@discordjs/builders';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the currently playing song'),
    async execute(interaction) {
        const player: Player = Player.getInstance();
        player.handleResume(interaction).then((msg) => {
            setTimeout(() => msg.delete(), 10_000);
        }).catch();
    },
};
