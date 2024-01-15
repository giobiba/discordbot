import {
    AudioPlayer,
    AudioResource,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus,
    createAudioPlayer,
    entersState,
    createAudioResource,
    AudioPlayerStatus,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import { EventEmitter } from '@src/player/eventEmitter';
import { Readable } from 'node:stream';
import { GuildQueue } from './guildQueue';
import { Track } from '@src/typing';

export type VoiceEvents = {
    error: [error: Error];
    debug: [message: string];
    start: [resource: AudioResource<Track>];
    paused: [];
    resume: [],
    finish: [resource: AudioResource<Track>];
    connDestroyed: [];
}

export class StreamDispatcher extends EventEmitter<VoiceEvents> {
    public voiceConnection: VoiceConnection;
    public audioPlayer: AudioPlayer;
    public voiceChannel: VoiceChannel;
    public readonly connectionTimeout: number;
    public audioResource?: AudioResource<Track> | null;
    public queue?: GuildQueue | null;

    constructor(connection: VoiceConnection, channel: VoiceChannel, queue: GuildQueue | null = null, audioPlayer?: AudioPlayer, connectionTimeout: number = 20000) {
        super();

        this.voiceConnection = connection;
        this.voiceChannel = channel;
        this.audioPlayer = audioPlayer || createAudioPlayer();
        this.queue = queue;

        this.voiceConnection.on('debug', (message) => this.emit('debug', message));
        this.voiceConnection.on('error', (error) => this.emit('error', error));
        this.audioPlayer.on('debug', (message) => this.emit('debug', message));
        this.audioPlayer.on('error', (error) => this.emit('error', error));

        this.voiceConnection
            .on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                if (newState.reason = VoiceConnectionDisconnectReason.Manual) {
                    this.destroy();
                    return;
                }
                else if (this.voiceConnection.rejoinAttempts < 5) {
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    this.voiceConnection.rejoin();
                }
                else {
                    try {
                        this.destroy();
                    }
                    catch (error) {
                        this.emit('error', error as Error);
                    }
                }
            })
            .on(VoiceConnectionStatus.Destroyed, async () => {
                this.audioPlayer.stop();
                this.emit('connDestroyed');
            });

        this.audioPlayer.on('stateChange', (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Paused && newState.status == AudioPlayerStatus.Paused) {
                this.emit('paused');
            }

            if (oldState.status === AudioPlayerStatus.Paused && newState.status !== AudioPlayerStatus.Paused) {
                this.emit('resume');
            }

            if (newState.status === AudioPlayerStatus.Playing && (oldState.status === AudioPlayerStatus.Idle || oldState.status === AudioPlayerStatus.Buffering)) {
                this.emit('start', this.audioResource!);
            }

            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                this.emit('finish', this.audioResource!);
                this.audioResource = null;
            }
        });

        this.connectionTimeout = connectionTimeout;

        this.voiceConnection.subscribe(this.audioPlayer);
    }

    destroy() {
        this.disconnect();
        this.audioPlayer.removeAllListeners();
        this.voiceConnection.removeAllListeners();
    }

    disconnect() {
        if (this.audioPlayer) this.audioPlayer.stop(true);
        if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
    }

    createAudioResource(src: Readable, data: any): AudioResource<any> {
        this.audioResource = createAudioResource(src, {
            metadata: data,
        });

        return this.audioResource!;
    }

    public async play(resource: AudioResource<Track> = this.audioResource!) {
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

    isPlaying() {
        return this.audioPlayer.state.status === AudioPlayerStatus.Playing;
    }

    isIdle() {
        return this.audioPlayer.state.status === AudioPlayerStatus.Idle;
    }
}
