import { Client } from '@utils/Client';
import { GatewayIntentBits } from 'discord.js';
import { Player } from '@src/player/player';

import { token } from '@config/config.json';

global.player = new Player(new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
    ],
}));

global.player.client.load(__dirname);
global.player.client.login(token);
