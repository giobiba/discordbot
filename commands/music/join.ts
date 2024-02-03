import { SlashCommandBuilder } from '@discordjs/builders';
import { alreadyConnected, memberNotConnected } from '@src/embeds/embeds';
import { GuildQueue } from '@src/player/guildQueue';
import { Player } from '@src/player/player';

export = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join the voice channel of the requester.'),
    async execute(interaction) {
        const vcId = interaction.member.voice.channelId;
        await interaction.deferReply();

        if (!vcId) {
            await interaction.editReply(memberNotConnected(true));
            return;
        }

        const guildId = interaction.guildId;
        const player = Player.getInstance();

        const guildQueue: GuildQueue = player.guildQueueManager.create(guildId, interaction.channelId);

        if (guildQueue.isConnected() && vcId === guildQueue.channelId) {
            await interaction.editReply(alreadyConnected(true));
            return;
        }

        guildQueue.connect(vcId);
        await interaction.deleteReply();
    },
};
