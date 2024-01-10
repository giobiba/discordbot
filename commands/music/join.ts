import { SlashCommandBuilder } from '@discordjs/builders';
import { joinVC } from '@utils/voice_utils';

export = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the requester.'),
    async execute(interaction) {
        if (interaction.member.voice.channel) {
            joinVC(interaction.member.voice.channel);
            await interaction.reply({ content: 'Joined!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'You are not connected to a voice channel!', ephemeral: true });
        }
    },
};
