import { SlashCommandBuilder } from '@discordjs/builders';
import { getVoiceConnection, createAudioResource } from '@discordjs/voice';
import { joinVC } from '@utils/voice_utils';
import ytdl from 'ytdl-core';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song to the bot')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('Name of the song')
            .setRequired(false)),
    async execute(interaction) {
        let url = interaction.options.getString('query');
        if (!url) {
            url = 'https://www.youtube.com/watch?v=BokbpfhV8O8';
        }

        if (!getVoiceConnection(interaction.guild.id)) {
            if (interaction.member.voice.channel) {
                joinVC(interaction.member.voice.channel);
            }
            else {
                interaction.reply('You are not connected to a voice channel');
                return;
            }
        }

        const stream = ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });

        global.resource = createAudioResource(stream);
        global.player.play(global.resource);

        await interaction.reply('playing....');
    },
};
