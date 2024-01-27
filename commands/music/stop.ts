import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Clear the bot queue and skip current song'),
    async execute(interaction) {
        const player = Player.getInstance();
        const guildQueue: GuildQueue | null = player.guildQueueManager.get(interaction.guildId) || null;

        if (!guildQueue || !guildQueue.isConnected()) {
            await interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });
        }
        else if (!guildQueue.currentTrack) {
            guildQueue.tracks.clear();

            await interaction.reply({ content: 'No song playing', ephemeral: true });
        }
        else {
            guildQueue.tracks.clear();

            if (guildQueue.queuePlayer.skip()) await interaction.reply({ content: 'Stopped' });
            else await interaction.reply({ content: 'Failed to stop' });
        }
    },
};
