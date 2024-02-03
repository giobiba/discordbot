import { GuildQueue } from '@src/player/guildQueue';
import { Track } from '@src/typing';
import ytdl from 'ytdl-core';
import { Readable } from 'node:stream';

export class GuildQueuePlayer {
    public queue: GuildQueue;

    public constructor(queue: GuildQueue) {
        this.queue = queue;
    }

    public async play(resource?: Track) {
        if (!this.queue.dispatcher) {
            throw Error('No connection');
        }

        const track: Track = resource || this.queue.tracks.dequeue()!;

        if (!track) {
            this.queue.emit('error', this.queue, Error('No track found'));
            return;
        }
        const stream = await this.generateStream(track);

        this.queue.dispatcher.createAudioResource(stream, track);
        this.queue.dispatcher.play();
        this.queue.currentTrack = track;
    }

    public skip() {
        if (!this.queue.dispatcher || !this.queue.currentTrack) return false;

        this.queue.dispatcher.stop();
        this.queue.currentTrack = null;

        return true;
    }

    public pause() {
        return this.queue.dispatcher?.pause();
    }

    public resume() {
        return this.queue.dispatcher?.resume();
    }

    public stop(force: boolean) {
        this.queue.tracks.clear();
        if (!this.queue.dispatcher) return false;
        this.queue.dispatcher.stop();
        if (force) this.queue.dispatcher.destroy();
        return true;
    }

    async generateStream(track: Track): Promise<Readable> {
        return ytdl(track.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
    }

    isDestroyed() {
        return !!this.queue.dispatcher?.isDestroyed();
    }

    isDisconnected() {
        return !!this.queue.dispatcher?.isDisconnected();
    }

    isPlaying() {
        return !!this.queue.dispatcher?.isPlaying();
    }

    isPaused() {
        return !!this.queue.dispatcher?.isPaused();
    }
}
