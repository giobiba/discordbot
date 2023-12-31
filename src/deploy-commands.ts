import { exportCommands, deployCommands } from '@utils/deploy_utils';
import path from 'node:path';


const basePath = path.join(__dirname, '../');

exportCommands(basePath).then((commands) => {
    const comnmandsJson: any[] = [];

    for (const command of commands) {
        comnmandsJson.push(command.data.toJSON());
    }

    deployCommands(comnmandsJson);
});
