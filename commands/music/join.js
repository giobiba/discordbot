const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

// Define destroy conection function to free memory
function handleDisconnect(connection) {
    return async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Connection is attempting to reconnect
        }
        catch (error) {
            if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                connection.destroy();
            }
        }
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the requester.'),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (channel) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            // remove listener if it exits
            connection.off(VoiceConnectionStatus.Disconnected, handleDisconnect(connection));
            // add listener
            connection.on(VoiceConnectionStatus.Disconnected, handleDisconnect(connection));

            connection.subscribe(global.player);

            await interaction.reply({ content: 'Joined!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'You are not connected to a voice channel!', ephemeral: true });
        }
    },
};