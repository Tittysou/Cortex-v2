const fs = require('fs');
const path = require('path');
const { info, warn, error, success, event, prefix } = require('../utils/logs');

const prefixHandler = (client) => {
    client.prefixCommands = new Map();
    const commandsPath = path.join(__dirname, '../prefix');

    const validateCommand = (command, filename) => {
        if (!command) {
            warn(`Command in ${filename} is null or undefined`);
            return false;
        }
        if (typeof command !== 'object') {
            warn(`Command in ${filename} is not an object`);
            return false;
        }
        if (!command.name || typeof command.name !== 'string') {
            warn(`Command in ${filename} is missing 'name' property or name is not a string`);
            return false;
        }
        if (!command.execute || typeof command.execute !== 'function') {
            warn(`Command in ${filename} is missing 'execute' function`);
            return false;
        }
        return true;
    };

    const loadCommand = (filename) => {
        try {
            const commandPath = path.join(commandsPath, filename);
            delete require.cache[require.resolve(commandPath)];
            const command = require(commandPath);

            if (!validateCommand(command, filename)) {
                return null;
            }

            command.filename = filename;
            command.lastLoaded = Date.now();

            return command;
        } catch (err) {
            error(`Failed to load prefix command from ${filename}: ${err}`);
            return null;
        }
    };

    const loadCommands = () => {
        try {
            if (!fs.existsSync(commandsPath)) {
                fs.mkdirSync(commandsPath, { recursive: true });
                warn(`Created prefix commands directory at ${commandsPath}`);
            }

            const previousCommands = new Set(client.prefixCommands.keys());
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = loadCommand(file);
                if (command) {
                    client.prefixCommands.set(command.name, command);
                    previousCommands.delete(command.name);
                }
            }

            for (const oldCommand of previousCommands) {
                client.prefixCommands.delete(oldCommand);
                info(`Removed prefix command: ${oldCommand}`);
            }

            prefix(`Loaded ${client.prefixCommands.size} prefix command(s)`);
        } catch (err) {
            error(`Failed to load prefix commands: ${err}`);
        }
    };

    const debounceMap = new Map();
    const handleCommandUpdate = (filename, delay = 500) => {
        const now = Date.now();
        if (debounceMap.has(filename) && now - debounceMap.get(filename) < delay) {
            return;
        }
        debounceMap.set(filename, now);

        try {
            const existingCommand = Array.from(client.prefixCommands.values())
                .find(cmd => cmd.filename === filename);

            if (!fs.existsSync(path.join(commandsPath, filename))) {
                if (existingCommand) {
                    client.prefixCommands.delete(existingCommand.name);
                    success(`Prefix command removed: ${existingCommand.name}`);
                }
                return;
            }

            const newCommand = loadCommand(filename);
            
            if (!newCommand) {
                if (existingCommand) {
                    client.prefixCommands.delete(existingCommand.name);
                    warn(`Removed invalid prefix command: ${existingCommand.name}`);
                }
                return;
            }

            if (existingCommand) {
                if (existingCommand.name !== newCommand.name) {
                    client.prefixCommands.delete(existingCommand.name);
                    success(`Prefix command renamed: ${existingCommand.name} → ${newCommand.name}`);
                } else {
                    success(`Prefix command updated: ${newCommand.name}`);
                }
            } else {
                success(`Prefix command added: ${newCommand.name}`);
            }

            client.prefixCommands.set(newCommand.name, newCommand);

        } catch (err) {
            error(`Error handling prefix command update for ${filename}: ${err}`);
        }
    };

    loadCommands();

    const watcher = fs.watch(commandsPath, (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
            handleCommandUpdate(filename);
        }
    });

    client.on('destroy', () => watcher.close());

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        const { prefix: commandPrefix } = require('../../config.json');
        if (!commandPrefix) {
            return;
        }        
        if (!message.content.startsWith(commandPrefix)) return;

        const args = message.content.slice(commandPrefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command = client.prefixCommands.get(commandName);
        if (!command) {
            return message.reply({
                content: 'Command doesn\'t exist!',
                allowedMentions: { repliedUser: true }
            });
        }

        try {
            if (command.permissions) {
                const missingPerms = command.permissions.filter(perm => !message.member.permissions.has(perm));
                if (missingPerms.length) {
                    return message.reply({
                        content: `You need the following permissions to use this command: ${missingPerms.join(', ')}`,
                        allowedMentions: { repliedUser: true }
                    });
                }
            }

            await command.execute(message, args, client);
        } catch (err) {
            error(`Error executing prefix command ${commandName}: ${err}`);
            try {
                await message.reply({
                    content: 'There was an error executing that command.',
                    allowedMentions: { repliedUser: false }
                });
            } catch (replyErr) {
                error('Failed to send error message:', replyErr);
            }
        }
    });
};

module.exports = prefixHandler;
