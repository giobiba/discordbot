import fs from 'node:fs';
import path from 'node:path';

import { REST, Routes } from 'discord.js';
import { clientId, token } from '@config/config.json';

import { CommandObject } from '@typing';

const rest = new REST().setToken(token);

const exportCommands = async (basePath: string) => {
    const commands: any[] = [];

    const foldersPath: string = path.join(basePath, 'commands');
    const commandFolders: string[] = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath: string = path.join(foldersPath, folder);
        const commandFiles: string[] = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath: string = path.join(commandsPath, file); /* 'file:///' += */
            const command: CommandObject = await require(filePath); /* import */
            if (command.data !== undefined && command.execute !== undefined) {
                commands.push(command);
            }
            else {
                console.log(`[WARNING] The command ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
};

const deployCommands = async (commands: any[]) => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // I guess if we want to do testing, we should add a guild id here to only deploy there
        const data: any = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error(error);
    }
};

const deployEvents = async (basePath: string) => {
    const discordEventsFolder = path.join(basePath, 'events', 'discord');
    const discordEvents = fs.readdirSync(discordEventsFolder).filter((file) => file.endsWith('.ts'));

    for (const file of discordEvents) {
        const filePath = path.join(discordEventsFolder, file);
        const event = await require(filePath);
        if (event.once) {
            global.client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            global.client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`-> [Loaded Discord Event] ${file.split('.')[0]}`);
    }

    // in the future to do the player events as well
};

export { exportCommands, deployCommands, deployEvents };
