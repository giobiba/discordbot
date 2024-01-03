import { SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

export = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption((option) =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply(`There is no command with name \`${commandName}\`!`);
        }

        const commandsFolder: string = path.dirname(__dirname);
        for (const folder of fs.readdirSync(commandsFolder)) {
            if (fs.readdirSync(path.join(commandsFolder, folder)).includes(commandName + '.ts')) {
                const commandPath: string = `@commands/${folder}/${command.data.name}`;

                delete require.cache[require.resolve(commandPath)];

                try {
                    interaction.client.commands.delete(command.data.name);
                    const newCommand = await require(commandPath);
                    interaction.client.commands.set(newCommand.data.name, newCommand);
                    return await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
                }
                catch (error: any) {
                    console.error(error);
                    return await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
                }
            }
        }
        await interaction.reply(`There is no command file with name \`${commandName}\`!`);
    },
};
