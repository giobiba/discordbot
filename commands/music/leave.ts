import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';

export = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            // call disconnect, freeing the connection is handled via event
            connection.disconnect();
            await interaction.reply({ content: 'Left!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });
        }
    },
};
