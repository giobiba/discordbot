import { exportCommands, deployCommands } from '@utils/deploy_utils';
import path from 'node:path';

const basePath = path.join(__dirname, '../');
const commands = exportCommands(basePath);

deployCommands(commands);
