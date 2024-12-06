const fs = require('fs');
const path = require('path');
const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const config = require('../../config.json');
const { info, warn, error, success, command } = require('../utils/logs');

const commandDirectory = path.join(__dirname, '../commands');

const loadCommands = (client) => {
  client.commands = new Map();

  const loadCommand = (filename) => {
    try {
      delete require.cache[require.resolve(`../commands/${filename}`)];
      const command = require(`../commands/${filename}`);

      if (command && command.data && command.data.name) {
        client.commands.set(command.data.name, command);
        return command.data.toJSON();
      } else {
        warn(`Skipped invalid or empty command in ${filename}`);
        return null;
      }
    } catch (err) {
      error(`Failed to load command from ${filename} ${err}`);
      return null;
    }
  };

  const commandFiles = fs.readdirSync(commandDirectory).filter(file => file.endsWith('.js'));
  const commands = commandFiles.map(file => loadCommand(file)).filter(Boolean);

  command(`Loaded ${client.commands.size} command(s).`);

  const updateCommands = async () => {
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
      await rest.put(Routes.applicationCommands(config.id), { body: Array.from(client.commands.values()).map(cmd => cmd.data.toJSON()) });
    } catch (err) {
      error(`Failed to register commands with Discord API: ${err}`);
    }
  };

  const debounceMap = new Map();

  const handleCommandUpdate = (filename, delay = 500) => {
    const now = Date.now();

    if (debounceMap.has(filename) && now - debounceMap.get(filename) < delay) return;

    debounceMap.set(filename, now);

    const commandName = filename.slice(0, -3);
    const command = loadCommand(filename);

    if (command) {
      success(`Command updated: ${commandName}`);
    } else {
      success(`Command removed: ${commandName}`);
      client.commands.delete(commandName);
    }

    updateCommands();
  };

  updateCommands();

  fs.watch(commandDirectory, (eventType, filename) => {
    if (filename.endsWith('.js')) {
      handleCommandUpdate(filename);
    }
  });
};

module.exports = { loadCommands };
