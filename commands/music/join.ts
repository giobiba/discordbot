import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the requester.'),
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            return await interaction.reply({ content: 'You are not connected to a voice channel', ephemeral: true });
        }

        const guildId = interaction.guildId;
        const player = Player.getInstance();

        const guildQueue: GuildQueue = player.guildQueueManager.create(guildId, interaction.channelId);

        if (guildQueue.isConnected() && interaction.member.voice.channel.id === guildQueue.channelId) {
            return await interaction.reply({ content: 'Already in your voice channel', ephemeral: true });
        }

        guildQueue.connect(interaction.member.voice.channel);
    },
};
