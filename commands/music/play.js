const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song to the bot')
        .addStringOption(option => option
            .setName('query')
            .setDescription('Name of the song')
            .setRequired(false)),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        let url = interaction.options.getString('query');

        if (!url) {
            url = 'https://www.youtube.com/watch?v=BokbpfhV8O8';
        }

        if (!connection) {
            await interaction.reply('Bot is not connected idiot');
            return;
        }

        const stream = ytdl(url, { filter : 'audioonly', volume: 0.5 });

        const resource = createAudioResource(stream);
        global.player.play(resource);

        await interaction.reply('playing....');
    },
};