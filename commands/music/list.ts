import { SlashCommandBuilder } from '@discordjs/builders';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lists all the songs in queue'),
    async execute(interaction) {
        const player = Player.getInstance();
        const guildQueue = player.guildQueueManager.get(interaction.guildId);

        if (!guildQueue) {
            return await interaction.reply({ content: 'Not connected', ephemeral: true });
        }
        else if (guildQueue?.isEmpty()) {
            return await interaction.reply({ content: 'No song in queue' });
        }

        interaction.reply({ content: guildQueue.listTracks(0, 5).join('\n') });
    },
};
