const fs = require('node:fs');
const path = require('node:path');

const { Collection } = require('discord.js');

const basePath = path.join(__dirname, '../');
const foldersPath = path.join(basePath, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const discordEventsFolder = path.join(basePath, 'events', 'discord');

const discordEvents = fs.readdirSync(discordEventsFolder).filter(file => file.endsWith('.js'));
// const playerEvents = fs.readdirSync(path.join(basePath, 'events', 'player')).filter(file => file.endsWith('.js'));

global.client.commands = new Collection();
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			global.client.commands.set(command.data.name, command);
		}
        else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
        console.log(`-> [Loaded Discord Command] ${file.split('.')[0]}`);
	}
}

console.log('-'.repeat(40));

for (const file of discordEvents) {
	const filePath = path.join(discordEventsFolder, file);
	const event = require(filePath);
	if (event.once) {
		global.client.once(event.name, (...args) => event.execute(...args));
	}
    else {
		global.client.on(event.name, (...args) => event.execute(...args));
	}
    console.log(`-> [Loaded Discord Event] ${file.split('.')[0]}`);
}

// for (const file of player_events) {
// 	// tbd
// }