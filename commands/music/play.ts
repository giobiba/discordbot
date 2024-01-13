import { SlashCommandBuilder } from '@discordjs/builders';
import { createVC } from '@utils/voice_utils';
import { StreamDispacher } from '@src/player/streamDispacher';
import ytdl from 'ytdl-core';

export = {
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

        if (!global.streamDispatcher) {
            if (interaction.member.voice.channel) {
                global.streamDispacher = new StreamDispacher(createVC(interaction.member.voice.channel), interaction.member.voice.channel);
            }
            else {
                interaction.reply('You are not connected to a voice channel');
                return;
            }
        }

        global.streamDispacher.createAudioResource(ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 }));
        global.streamDispacher.play();
    },
};
