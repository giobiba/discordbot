import { Track, Playlist, Playable } from '@typing';
import { Queue } from '@src/player/queue';
import { Player } from '@src/player/player';
import { StreamDispatcher } from './streamDispatcher';
import { Snowflake, TextChannel, VoiceChannel } from 'discord.js';
import { EventEmitter } from './eventEmitter';
import * as VoiceUtils from '@src/utils/voiceUtils';
import { GuildQueuePlayer } from './guildQueuePlayer';
import { playingEmbed } from '@src/embeds/embeds';

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
    public commChannel: TextChannel;

    public constructor(player: Player, commChannel: Snowflake) {
        super();

        this.tracks = new Queue<Track>();
        this.player = player;
        this.queuePlayer = new GuildQueuePlayer(this);
        this.commChannel = this.player.client.channels.cache.get(commChannel) as TextChannel;
    }

    private attachListeners(dispatcher: StreamDispatcher) {
        dispatcher.on('error', (e) => this.emit('error', this, e));
        dispatcher.on('debug', (m) => this.debug(m));
        dispatcher.on('finish', (track) => this.performFinish(track));
        dispatcher.on('start', async (track) => await this.performStart(track));
        dispatcher.on('connDestroyed', () => {
            dispatcher.destroy();
            this.dispatcher = null;
        });
    }

    public debug(m: string) {
        this.emit('debug', this, m);
    }


    private async performStart(track: Track) {
        this.currentTrack = track;

        console.log(`Now playing: ${track.title}`);
        await this.commChannel.send({
            embeds: [playingEmbed(track)],
        });
    }

    private performFinish(prevTrack: Track) {
        this.currentTrack = null;
        if (!this.tracks.size()) {
            console.log(`Finished playing!`);
            return;
        }

        const track: Track = this.tracks.dequeue()!;
        this.queuePlayer.play(track);
        this.debug(`Finished playing: ${prevTrack.title}`);
    }

    public skip() {
        return this.queuePlayer.skip();
    }

    public connect(voiceChannel: VoiceChannel) {
        let channel = this.player.client.channels.resolve(voiceChannel);
        if (!channel || ! channel.isVoiceBased()) throw Error('Not a voice channel');

        channel = channel as VoiceChannel;

        if (this.dispatcher && channel.id !== this.dispatcher.voiceChannel.id) {
            this.dispatcher.destroy();
            this.dispatcher = null;
        }

        this.dispatcher = VoiceUtils.connect(channel, this);

        this.attachListeners(this.dispatcher);
        return this;
    }

    public disconnect() {
        this.dispatcher?.disconnect();
    }

    public isConnected() {
        return this.dispatcher && !this.queuePlayer.isDestroyed() && !this.queuePlayer.isDisconnected();
    }

    public isEmpty() {
        return this.tracks.size() === 0;
    }

    get channelId() {
        if (!this.isConnected()) return undefined;
        return this.dispatcher!.voiceChannel.id;
    }

    public async play(playable: Playable) {
        let tracks: Track[] = [playable as Track];
        if ((playable as Playlist).tracks) {
            tracks = (playable as Playlist).tracks;
        }

        this.tracks.enqueue(tracks);

        if (!this.currentTrack) {
            this.queuePlayer.play();
        }
        else {
            this.debug(`Added ${playable.title} queue`);
        }
    }

    public listTracks(stratIndex: number, endIndex: number): string[] {
        return this.tracks.map((t) => `${t.title} - ${t.author}`).slice(stratIndex, endIndex);
    }
}
