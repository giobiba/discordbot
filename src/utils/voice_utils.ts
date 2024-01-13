import { VoiceChannel } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

const createVC = (channel: VoiceChannel) => {
    return joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
};

export { createVC };
