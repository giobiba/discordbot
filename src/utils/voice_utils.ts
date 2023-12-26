import { VoiceChannel } from 'discord.js';
import { joinVoiceChannel, VoiceConnectionStatus, entersState, VoiceConnection } from '@discordjs/voice';

// Define the destroy connection function to free memory
const handleDisconnect = (connection: VoiceConnection): (() => Promise<void>) => {
    return async (): Promise<void> => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        // Connection is attempting to reconnect
        } catch (error) {
            if (connection &&
                connection.state.status !== VoiceConnectionStatus.Destroyed) {
                connection.destroy();
            }
        }
    };
};

const joinVC = (channel: VoiceChannel): VoiceConnection => {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    // Remove listener if it exists
    connection.off(VoiceConnectionStatus.Disconnected, handleDisconnect(connection));
    // Add listener
    connection.on(VoiceConnectionStatus.Disconnected, handleDisconnect(connection));

    connection.subscribe(globalThis.player); // Ensure that 'player' is declared in the global scope

    return connection;
};

export { handleDisconnect, joinVC };
