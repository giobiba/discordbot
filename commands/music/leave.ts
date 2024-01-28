import { SlashCommandBuilder } from '@discordjs/builders';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),
    async execute(interaction) {
        const player = Player.getInstance();
        const guildQueue = player.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.isConnected()) {
            return await interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });
        }

        guildQueue.disconnect();
        interaction.reply({ content: 'Disconnecting...' });
    },
};
