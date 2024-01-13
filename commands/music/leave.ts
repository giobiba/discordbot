import { SlashCommandBuilder } from '@discordjs/builders';

export = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),
    async execute(interaction) {
        if (global.streamDispatcher) {
            global.streamDispatcher.disconnect();
            global.streamDispatcher = null;
            interaction.reply({ content: 'Bye' });
        }
        else {
            await interaction.reply({ content: 'Currently not in any channel.', ephemeral: true });
        }
    },
};
