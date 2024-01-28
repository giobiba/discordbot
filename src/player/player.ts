import { Client } from '@utils/Client';
import { GuildQueueManager } from './guildQueueManager';
import { Playable, SearchItem } from '@src/typing';
import { GuildQueue } from './guildQueue';
import { fetchYouTube, identifyUrlType, searchYouTube } from '@src/utils/linkUtils';
import { didNotRespond, searchResultsEmbed } from '@src/embeds/embeds';

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

        if (item) return item;

        const searchResultsOfQuery: SearchItem[] = await searchYouTube(query);

        if (searchResultsOfQuery.length === 0) {
            interaction.reply('Youtube did not yield any search results. Try again!');
            return null;
        }

        const response = await interaction.reply(searchResultsEmbed(searchResultsOfQuery));

        try {
            const confirmation = await response.awaitMessageComponent({ time: 5_000 });

            item = searchResultsOfQuery.find((el) => el.id == confirmation.customId)!;
            await interaction.editReply({ content: `You chose ${item.title!}`, embeds: [], components: [] });
            return item;
        }
        catch (e) {
            interaction.editReply(didNotRespond()).then((msg) => {
                setTimeout(() => msg.delete(), 5_000);
            }).catch();
            return null;
        }
    }

    public async play(item: SearchItem, interaction: any) {
        const guildQueue: GuildQueue = this.guildQueueManager.create(interaction.guildId, interaction.channelId);

        if (!guildQueue.isConnected() || interaction.member.voice.channel.id !== guildQueue.channelId) {
            guildQueue.connect(interaction.member.voice.channel);
        }

        const playable: Playable = await fetchYouTube(item);
        if (guildQueue.currentTrack) await interaction.followUp({ content: `Added ${playable.title} to queue` });

        guildQueue.play(playable);
    }

    public async handlePause(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.currentTrack) return interaction.reply({ content: 'Not playing a song' });

        if (guildQueue.queuePlayer.isPlaying()) {
            if (guildQueue.queuePlayer.pause()) return interaction.reply({ content: 'Paused' });
            else return interaction.reply({ content: 'Failed to pause' });
        }
        else if (guildQueue.queuePlayer.isPaused()) {
            return interaction.reply({ content: 'Already paused' });
        }
    }

    public async handleResume(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.currentTrack) return interaction.reply({ content: 'Not playing a song' });

        if (guildQueue.queuePlayer.isPaused()) {
            if (guildQueue.queuePlayer.resume()) return interaction.reply({ content: 'Resuming...' });
            else return interaction.reply({ content: 'Failed to resume' });
        }
        else if (guildQueue.queuePlayer.isPlaying()) {
            return interaction.reply({ content: 'Not paused' });
        }
    }

    public async handleSkip(interaction: any) {
        const guildQueue: GuildQueue | null = this.guildQueueManager.get(interaction.guildId);

        if (!guildQueue || !guildQueue.isConnected()) return interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });

        if (!guildQueue.currentTrack) return interaction.reply({ content: 'No song playing' });

        if (guildQueue.skip()) {
            return interaction.reply({ content: 'Skipped' });
        }
        else {
            return interaction.reply({ content: 'Failed to skip' });
        }
    }
}
