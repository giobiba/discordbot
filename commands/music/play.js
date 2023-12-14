const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song to the bot')
        .addStringOption(option => option
            .setName('query')
            .setDescription('Name of the song')
            .setRequired(true)),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            await interaction.reply('Bot is not connected idiot');
            return;
        }

        global.player.play(global.resource);

        await interaction.reply('playing....');
    },
};