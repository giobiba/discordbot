const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the user calling the function'),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;

        if (channel) {
            let connection = getVoiceConnection(interaction.guild.id);
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
            }
            else if (connection.joinConfig.channelId != channel.id) {
                connection.disconnect();
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
            }

            await interaction.deferReply({ content: 'Hi!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'You are not connected to a channel', ephemeral: true });
        }
    },
};