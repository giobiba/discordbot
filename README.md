# discordbot

Previous version: [qbot](https://github.com/raresboza/qbot)
## Setup

Create a config/config.json with the `token` and  `clientId` fields.

To install dependencies do and activate pre-commit hook:
```
npm install
```
## Run
The execution engine that we use is `ts-node`, to be able to do path mapping with `tsconfig-paths`.
So before running we also need to intall:
```
npm i -g ts-node
```
Firstly we need to deploy the commands by runnning:
```
ts-node src/deploy-commands.ts
```
Then, to start the bot, we run the command:
```
ts-node index.ts
```