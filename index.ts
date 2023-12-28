import { Client, GatewayIntentBits } from 'discord.js';
import { createAudioPlayer } from '@discordjs/voice';

import { token } from '@config/config.json';

global.client = new Client({
	intents: [
		GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
	],
}),
global.player = createAudioPlayer();

// load the commands and events
import '@src/loader';

global.client.login(token);