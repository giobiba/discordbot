import { VoiceConnection, VoiceConnectionStatus, joinVoiceChannel } from '@discordjs/voice';
import { GuildQueue } from '@src/player/guildQueue';
import { StreamDispatcher } from '@src/player/streamDispatcher';
import { VoiceChannel } from 'discord.js';

function connect( channel: VoiceChannel, queue: GuildQueue): StreamDispatcher {
    const conn = join(channel);
    const strDisp = new StreamDispatcher(conn, channel, queue);

    return strDisp;
}

function join(channel: VoiceChannel) {
    const conn = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    return conn;
}

function disconnect(connection: VoiceConnection | StreamDispatcher ) {
    if (connection instanceof StreamDispatcher) connection = connection.voiceConnection;

    if (connection.state.status !== VoiceConnectionStatus.Destroyed) connection.destroy();
}


export { connect, join, disconnect };
