import { Client } from '@utils/Client';
import { GuildQueueManager } from './guildQueueManager';

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
}
