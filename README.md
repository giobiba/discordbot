# discordbot

Previous version: [qbot](https://github.com/raresboza/qbot)
## Setup

Create a config/config.json with the `token` and  `clientId` fields.

To install dependencies and activate pre-commit hook:
```
npm install
```
## Run
The execution engine that we use is `ts-node`, in order to be able to do path mapping with `tsconfig-paths`.
Therefore, before running we also need to install:
```
npm i -g ts-node
```
Deploy the commands of the bot by running:
```
ts-node src/deploy-commands.ts
```
Start the bot using the following command:
```
ts-node index.ts
```