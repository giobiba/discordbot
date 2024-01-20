import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),
    async execute(interaction) {
        const player = Player.getInstance();

        const guildQueue: GuildQueue | null = player.guildQueueManager.get(interaction.guildId) || null;

        if (!guildQueue || !guildQueue.isConnected()) {
            await interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });
            return;
        }
        console.log(guildQueue.dispatcher?.state);

        guildQueue.disconnect();
        interaction.reply({ content: 'Disconnecting...' });
    },
};
