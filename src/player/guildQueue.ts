import { Track } from '@typing';
import { Queue } from '@src/player/queue';
import { Player } from '@src/player/player';
import { StreamDispatcher } from './streamDispatcher';
import { VoiceChannel } from 'discord.js';
import { AudioResource } from '@discordjs/voice';
import { EventEmitter } from './eventEmitter';
import * as VoiceUtils from '@src/utils/voiceUtils';
import { GuildQueuePlayer } from './guildQueuePlayer';

export type GuildQueueEvents = {
    error: [queue: GuildQueue, error: Error];
    debug: [queue: GuildQueue, message: string];
};

export class GuildQueue extends EventEmitter<GuildQueueEvents> {
    public tracks: Queue<Track>;
    public dispatcher: StreamDispatcher | null = null;
    public player: Player;
    public queuePlayer: GuildQueuePlayer;
    public currentTrack: Track | null = null;

    public constructor(player: Player) {
        super();

        this.tracks = new Queue<Track>();
        this.player = player;
        this.queuePlayer = new GuildQueuePlayer(this);
    }

    public async connect(voiceChannel: VoiceChannel) {
        let channel = this.player.client.channels.resolve(voiceChannel);
        if (!channel || ! channel.isVoiceBased()) throw Error('Not a voice channel');

        channel = channel as VoiceChannel;

        if (this.dispatcher && channel.id !== this.dispatcher.voiceChannel.id) {
            this.dispatcher.destroy();
            this.dispatcher = null;
        }

        this.dispatcher = VoiceUtils.connect(channel, this);

        this.attachListeners(this.dispatcher);
    }

    private attachListeners(dispatcher: StreamDispatcher) {
        dispatcher.on('error', (e) => this.emit('error', this, e));
        dispatcher.on('debug', (m) => this.debug(m));
        dispatcher.on('finish', (resource) => this.performFinish(resource));
        dispatcher.on('start', (resource) => this.performStart(resource));
        dispatcher.on('connDestroyed', () => {
            dispatcher.destroy();
            this.dispatcher = null;
        });
    }

    public debug(m: string) {
        this.emit('debug', this, m);
    }

    // TODO: implement these functions
    /* eslint-disable @typescript-eslint/no-unused-vars */
    private performStart(resource: AudioResource<Track>) {
        this.currentTrack = resource.metadata;
    }

    private performFinish(resource: AudioResource<Track>) {
        if (!this.tracks.size()) {
            // queue is empty
            return;
        }

        const track: Track = this.tracks.dequeue()!;
        this.queuePlayer.play(track);
        this.currentTrack = null;
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */
}
