import { AudioPlayer, AudioResource, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus, createAudioPlayer, entersState } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import { EventEmitter } from '@src/player/eventEmitter';

export class StreamDispacher extends EventEmitter {
    public voiceConnection: VoiceConnection;
    public audioPlayer: AudioPlayer;
    public voiceChannel: VoiceChannel;
    public readonly connectionTimeout: number;
    public audioResource?: AudioResource | null;

    constructor(connection: VoiceConnection, channel: VoiceChannel, audioPlayer?: AudioPlayer, connectionTimeout: number = 20000) {
        super();

        this.voiceConnection = connection;
        this.voiceChannel = channel;
        this.audioPlayer = audioPlayer || createAudioPlayer();

        this.voiceConnection
            .on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                if (newState.reason = VoiceConnectionDisconnectReason.Manual) {
                    this.destroy();
                }
                else {
                    // idk
                }
            })
            .on(VoiceConnectionStatus.Destroyed, async () => {
                this.audioPlayer.stop();
            });
        this.connectionTimeout = connectionTimeout;
    }

    destroy() {
        this.disconnect();
        this.audioPlayer.removeAllListeners();
        this.voiceConnection.removeAllListeners();
    }

    disconnect() {
        if (this.audioPlayer) this.audioPlayer.stop(true);
        if (this.voiceConnection.state.status != VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
    }

    public async play(resource: AudioResource = this.audioResource!) {
        if (!resource) {
            throw Error('No resource');
        }

        if (!this.audioResource) this.audioResource = resource;

        if (this.voiceConnection.state.status !== VoiceConnectionStatus.Ready) {
            await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, this.connectionTimeout);
        }

        this.audioPlayer.play(resource);
    }

    pause() {
        return this.audioPlayer.pause();
    }

    stop() {
        this.audioPlayer.stop();
    }

    resume() {
        return this.audioPlayer.unpause();
    }
}
