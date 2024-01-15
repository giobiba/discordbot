import fs from 'node:fs';
import path from 'node:path';

import { REST, Routes } from 'discord.js';
import { clientId, token } from '@config/config.json';

import { CommandObject } from '@typing';

const rest = new REST().setToken(token);

const exportCommands = async (basePath: string) => {
    const commands: CommandObject[] = [];

    const foldersPath: string = path.join(basePath, 'commands');
    const commandFolders: string[] = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath: string = path.join(foldersPath, folder);
        const commandFiles: string[] = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath: string = `@commands/${folder}/${file.split('.')[0]}`; /* 'file:///' += */
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

const deployCommands = async (commands: CommandObject[]) => {
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

export { exportCommands, deployCommands };
