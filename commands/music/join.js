const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const resource = createAudioResource('./sound.mp3');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the user calling the function'),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;

        // console.log(channel);
        if (channel) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            await interaction.deferReply({ ephemeral: true });

            const player = createAudioPlayer();
            connection.subscribe(player);

            player.on('error', error => {
                console.log(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
            });

            player.play(resource);
            await interaction.editReply('Done :)');

            player.stop();
        }
        else {
            await interaction.reply('You are not connected to a voice channel');
        }
    },
};