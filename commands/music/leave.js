const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
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