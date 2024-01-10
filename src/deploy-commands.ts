import { exportCommands, deployCommands } from '@utils/deploy_utils';
import path from 'node:path';


const basePath = path.join(__dirname, '../');

exportCommands(basePath).then((commands) => {
    const commandsJson: any[] = [];

    for (const command of commands) {
        commandsJson.push(command.data.toJSON());
    }

    deployCommands(commandsJson);
});
