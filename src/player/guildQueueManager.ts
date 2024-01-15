import { Collection, GuildResolvable } from 'discord.js';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';
import { Snowflake } from 'discord-api-types/globals';

export class GuildQueueManager {
    public queues: Collection<Snowflake, GuildQueue>;
    public player: Player;

    constructor(player: Player) {
        this.queues = new Collection();
        this.player = player;
    }

    public create(guildResolvable: GuildResolvable): GuildQueue {
        const guild = this.player.client.guilds.resolve(guildResolvable);
        if (!guild) throw Error('No guild');

        if (this.queues.has(guild.id)) {
            return this.queues.get(guild.id)!;
        }

        const queue = new GuildQueue(this.player);

        this.queues.set(guild.id, queue);

        return queue;
    }

    public get(id: Snowflake) {
        return this.queues.get(id);
    }

    public has(id: Snowflake) {
        return this.queues.has(id);
    }

    public delete(id: Snowflake) {
        const queue = this.get(id)!;
        queue.queuePlayer.stop(true);

        return this.queues.delete(id);
    }
}
