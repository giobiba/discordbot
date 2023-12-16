const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer } = require('@discordjs/voice');

const { token } = require('./config.json');

global.client = new Client({
	intents: [
		GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates,
	],
}),

global.player = createAudioPlayer();

require('./src/loader');

global.client.login(token);