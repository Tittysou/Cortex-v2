const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./functions/loadEvents');
const { loadCommands } = require('./functions/loadCommands');
const { logTotalLines } = require('./utils/LineCount');
const { checkIntents } = require('./utils/IntentChecker');
const { initializeComponents } = require('./functions/loadComponents');
const { info, success, warn, error } = require('./utils/logs');
const prefixHandler = require('./functions/loadPrefix');
const checkConfig = require('./functions/loadConfig');
const connectToDatabase = require('./MDatabase');
const { interactionLogger } = require('./utils/UserLogs');
const { WebhookUtil } = require('./utils/WebhookUtil');
const { readJSON, writeJSON } = require('./utils/FileUtils');
const { simplecron } = require('./utils/Cron');
const config = require('../config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
});

// example of readJSON and writeJSON
async function fetchData() {
  try {
    const data = await readJSON('./config.json');
    //info(data);
  } catch (error) {
    console.error('Failed to read user data:', error);
  }
}

const data = {
  userId: 1,
  username: "Titsou",
  role: "admin",
  preferences: {
    theme: "dark",
    notifications: true
  }
};

const filePath = './example.json'; // you can change the name to anything (it also creates the file if it doesn't exist)
writeJSON(filePath, data);

// example of simple cron
/*simplecron('10s', () => {
  info('Task executed');
});*/

const initializeBot = async () => {
    await checkConfig();
    require('./utils/packageChecker')(client);
    loadEvents(client);
    loadCommands(client);
    interactionLogger(client);
    initializeComponents(client);
    prefixHandler(client);
    checkIntents(client);
    connectToDatabase(client);
    logTotalLines(client);
    WebhookUtil(client);
    fetchData(client);

    const ButtonHandler = require('./handlers/buttonHandler');
    const SelectMenuHandler = require('./handlers/menuHandler');
    const ModalHandler = require('./handlers/modalHandler');
    const ContextMenuHandler = require('./handlers/contextMenuHandler');

    const buttonHandler = new ButtonHandler(client);
    const selectMenuHandler = new SelectMenuHandler(client);
    const modalHandler = new ModalHandler(client);
    const contextMenuHandler = new ContextMenuHandler(client);

    await Promise.all([
      buttonHandler.loadButtons(),
      selectMenuHandler.loadSelectMenus(),
      modalHandler.loadModals(),
      contextMenuHandler.loadContextMenus()
    ]);

    client.on('interactionCreate', async (interaction) => {
        try {
            if (interaction.isButton()) await buttonHandler.handleButton(interaction);
            else if (interaction.isAnySelectMenu()) await selectMenuHandler.handleSelectMenu(interaction);
            else if (interaction.isModalSubmit()) await modalHandler.handleModal(interaction);
            else if (interaction.isContextMenuCommand()) await contextMenuHandler.handleContextMenu(interaction);
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    });

    client.login(config.token);
};

initializeBot();
