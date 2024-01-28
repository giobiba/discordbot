import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Clear the bot queue and skip current song'),
    async execute(interaction) {
        const player = Player.getInstance();
        const guildQueue: GuildQueue | null = player.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.isConnected()) {
            return await interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });
        }

        guildQueue.tracks.clear();

        if (!guildQueue.currentTrack) {
            await interaction.reply({ content: 'No song playing', ephemeral: true });
        }
        else {
            if (guildQueue.queuePlayer.skip()) await interaction.reply({ content: 'Stopped' });
            else await interaction.reply({ content: 'Failed to stop' });
        }
    },
};
