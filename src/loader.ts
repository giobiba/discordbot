import { exportCommands, deployEvents } from '@utils/deploy_utils';
import { Collection } from 'discord.js';
import path from 'node:path';

const basePath = path.join(__dirname, '../');

global.client.commands = new Collection();

const commands = exportCommands(basePath);

for (const command of commands) {
    global.client.commands.set(command.name, command);
    console.log(`-> [Loaded Discord Command] ${command.name}`);
}

console.log('\n' + '-'.repeat(40) + '\n');

deployEvents(basePath);
