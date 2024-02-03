import { SlashCommandBuilder } from '@discordjs/builders';
import { botNotConnected, disconnected } from '@src/embeds/embeds';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),
    async execute(interaction) {
        const player = Player.getInstance();
        const guildQueue = player.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.isConnected()) {
            return await interaction.reply(botNotConnected(true));
        }

        guildQueue.disconnect();
        await interaction.reply(disconnected());
    },
};
