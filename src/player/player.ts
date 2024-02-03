import { Client } from '@utils/Client';
import { GuildQueueManager } from './guildQueueManager';
import { Playable, SearchItem } from '@src/typing';
import { GuildQueue } from './guildQueue';
import { fetchYouTube, identifyUrlType, searchYouTube } from '@src/utils/linkUtils';
import { alreadyPaused, notPaused, botNotConnected, didNotRespond, failedPause, failedResume, noSongPlaying, paused, resumed, searchResultsEmbed, skipped, skipFailed, stopped, stopFailed } from '@src/embeds/embeds';

export class Player {
    public readonly client: Client;
    public guildQueueManager: GuildQueueManager;

    private static instance: Player;

    constructor(client: Client) {
        this.client = client;
        this.client.player = this;
        this.guildQueueManager = new GuildQueueManager(this);
    }

    public static create(client: Client) {
        if (!Player.instance) {
            Player.instance = new Player(client);
        }
        return Player.instance;
    }

    public static getInstance(): Player {
        if (!Player.instance) {
            throw Error('Player singleton not yet created');
        }
        return Player.instance;
    }

    public async search(query: string, interaction): Promise<SearchItem | null> {
        let item: SearchItem | null = identifyUrlType(query);

        if (item) {
            interaction.deferReply();
            return item;
        }

        const searchResultsOfQuery: SearchItem[] = await searchYouTube(query);

        if (searchResultsOfQuery.length === 0) {
            interaction.reply('Youtube did not yield any search results. Try again!');
            return null;
        }

        const response = await interaction.reply(searchResultsEmbed(searchResultsOfQuery));

        try {
            const confirmation = await response.awaitMessageComponent({ time: 15_000 });

            item = searchResultsOfQuery.find((el) => el.id == confirmation.customId)!;
            return item;
        }
        catch (e) {
            console.log(e);
            interaction.editReply(didNotRespond()).then((msg) => {
                setTimeout(() => msg.delete(), 3_000);
            }).catch();
            return null;
        }
    }

    public async play(item: SearchItem, interaction: any) {
        const vcId = interaction.member.voice.channelId;
        const guildQueue: GuildQueue = this.guildQueueManager.create(interaction.guildId, interaction.channelId);

        if (!guildQueue.isConnected() || vcId !== guildQueue.channelId) {
            guildQueue.connect(vcId);
        }

        const playable: Playable = await fetchYouTube(item);
        guildQueue.play(playable);
    }

    public async handlePause(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.currentTrack) return interaction.reply(noSongPlaying(false));

        if (guildQueue.queuePlayer.isPlaying()) {
            if (guildQueue.queuePlayer.pause()) return interaction.reply(paused());
            else return interaction.reply(failedPause());
        }
        else if (guildQueue.queuePlayer.isPaused()) {
            return interaction.reply(alreadyPaused());
        }
        else {
            guildQueue.debug('What the fuck');
        }
    }

    public async handleResume(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.currentTrack) return interaction.reply(noSongPlaying(false));

        if (guildQueue.queuePlayer.isPaused()) {
            if (guildQueue.queuePlayer.resume()) return interaction.reply(resumed());
            else return interaction.reply(failedResume());
        }
        else if (guildQueue.queuePlayer.isPlaying()) {
            return interaction.reply(notPaused());
        }
        else {
            guildQueue.debug('What the fuck');
        }
    }

    public async handleSkip(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.isConnected()) return interaction.reply(botNotConnected(true));

        if (!guildQueue.currentTrack) return interaction.reply(noSongPlaying(false));

        if (guildQueue.skip()) {
            return interaction.reply(skipped());
        }
        else {
            return interaction.reply(skipFailed());
        }
    }

    public async handleStop(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.isConnected()) {
            return interaction.reply(botNotConnected(true));
        }

        guildQueue.tracks.clear();

        if (!guildQueue.currentTrack) {
            return interaction.reply(noSongPlaying(false));
        }
        else {
            if (guildQueue.queuePlayer.skip()) return interaction.reply(stopped());
            else return interaction.reply(stopFailed());
        }
    }
}
