import { Client as Cl, Collection } from 'discord.js';
import { exportCommands } from '@src/utils/deployUtils';
import fs from 'node:fs';
import path from 'node:path';
import { Player } from '@src/player/player';

export class Client extends Cl {
    commands: Collection<any, any>;
    player: Player | null = null;

    constructor(options) {
        super(options);
        this.commands = new Collection();
    }

    public async load(basePath: string) {
        await this.deployCommands(basePath);
        console.log('\n' + '-'.repeat(40) + '\n');
        await this.deployEvents(basePath);
    }

    public async deployCommands(basePath: string) {
        const commands = await exportCommands(basePath);

        for (const command of commands) {
            this.commands.set(command.data.name, command);
            console.log(`-> [Loaded Discord Command] ${command.data.name}`);
        }
    }

    public async deployEvents(basePath: string) {
        const discordEventsFolder = path.join(basePath, 'events', 'discord');
        const discordEvents = fs.readdirSync(discordEventsFolder).filter((file) => file.endsWith('.ts'));

        for (const file of discordEvents) {
            const filePath = path.join(discordEventsFolder, file);
            const event = await require(filePath);
            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args));
            }
            else {
                this.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`-> [Loaded Discord Event] ${file.split('.')[0]}`);
        }
        // in the future to do the player events as well
    }
}
