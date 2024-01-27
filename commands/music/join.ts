import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the requester.'),
    async execute(interaction) {
        const guildId = interaction.guildId;
        const player = Player.getInstance();

        const guildQueue: GuildQueue = player.guildQueueManager.create(guildId, interaction.channelId);

        if (interaction.member.voice.channel) {
            if (!guildQueue.isConnected() || interaction.member.voice.channelId !== guildQueue.channelId) {
                guildQueue.connect(interaction.member.voice.channel);

                await interaction.reply({ content: 'Joined!', ephemeral: true });
            }
            else {
                await interaction.reply({ content: 'Already connected!', ephemeral: true });
            }
        }
        else {
            await interaction.reply({ content: 'You are not connected to a voice channel!', ephemeral: true });
        }
    },
};
