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

function joinVC(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    // remove listener if it exits
    connection.off(VoiceConnectionStatus.Disconnected, handleDisconnect(connection));
    // add listener
    connection.on(VoiceConnectionStatus.Disconnected, handleDisconnect(connection));

    connection.subscribe(global.player);

    return connection;
}

module.exports = {
    handleDisconnect,
    joinVC,
};