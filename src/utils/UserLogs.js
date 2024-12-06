const { info, success, warn, error, debug, created, deleted, updated } = require('./logs');
const config = require('../../config.json');
const PREFIX = config.prefix;

const developerIds = config.developerIds;
const devGuildIds = config.devGuild;

const formatDetails = (details, actionType) => {
    if (actionType.includes('slash_command')) {
        const options = [];
        for (const [name, data] of Object.entries(details.options)) {
            if (data.subOptions) {
                const subOptions = Object.entries(data.subOptions)
                    .map(([subName, subData]) => `${subName}: ${subData.value}`)
                    .join(', ');
                options.push(`${name} (${subOptions})`);
            } else {
                options.push(`${name}: ${data.value}`);
            }
        }
        return `executed /${details.commandName}${options.length ? ' ' + options.join(' ') : ''}`;
    }
    
    if (actionType.includes('button')) {
        return `clicked on [${details.label || details.customId}]`;
    }
    
    if (actionType.includes('select_menu')) {
        if (details.values) {
            return `Selected: ${details.values.join(', ')}`;
        }
        if (details.channels) {
            return `Selected channels: ${details.channels.map(c => '#' + c.name).join(', ')}`;
        }
        if (details.roles) {
            return `Selected roles: ${details.roles.map(r => '@' + r.name).join(', ')}`;
        }
        if (details.users) {
            return `Selected users: ${details.users.map(u => '@' + u.username).join(', ')}`;
        }
        if (details.mentionables) {
            return `Selected mentionables: ${details.mentionables.map(m => '@' + m.username).join(', ')}`;
        }
    }
    
    if (actionType.includes('modal')) {
        const fields = details.components
            .flatMap(row => row.components)
            .map(comp => `${comp.customId}: ${comp.value}`)
            .join(', ');
        return `Modal "${details.customId}" with fields: ${fields}`;
    }
    
    if (actionType.includes('context_menu')) {
        return `Context menu: ${details.commandName}`;
    }
    
    if (actionType.includes('autocomplete')) {
        return `Autocomplete for /${details.commandName}, typing "${details.focusedOption.value}" in ${details.focusedOption.name}`;
    }
    
    return JSON.stringify(details);
};

const createDetailedLog = (interaction, actionType, details) => {
    const { user, guild, channel } = interaction;
    const timestamp = new Date().toISOString();
    
    const logData = {
        timestamp,
        user: {
            username: user.username,
            id: user.id,
            tag: user.tag
        },
        server: guild ? {
            name: guild.name,
            id: guild.id
        } : null,
        channel: channel ? {
            name: channel.name,
            id: channel.id,
            type: channel.type
        } : null,
        actionType,
        details
    };

        const formattedDetails = formatDetails(details, actionType);
        const readableLog = `${user.tag} (${user.id}) ${formattedDetails}`;
        info(readableLog);
};

const getCommandDetails = (interaction) => {
    const details = {
        commandName: interaction.commandName,
        options: {}
    };

    if (interaction.options) {
        interaction.options.data.forEach(option => {
            details.options[option.name] = {
                value: option.value,
                type: option.type
            };

            if (option.options) {
                details.options[option.name].subOptions = {};
                option.options.forEach(subOption => {
                    details.options[option.name].subOptions[subOption.name] = {
                        value: subOption.value,
                        type: subOption.type
                    };
                });
            }
        });
    }

    return details;
};

const getComponentDetails = (interaction) => {
    const details = {
        customId: interaction.customId,
        componentType: interaction.componentType
    };

    if (interaction.isButton()) {
        details.buttonStyle = interaction.component?.style;
        details.label = interaction.component?.label;
    } 
    else if (interaction.isStringSelectMenu()) {
        details.values = interaction.values;
        details.placeholder = interaction.component?.placeholder;
    }
    else if (interaction.isChannelSelectMenu()) {
        details.channels = interaction.channels.map(channel => ({
            name: channel.name,
            id: channel.id,
            type: channel.type
        }));
    }
    else if (interaction.isRoleSelectMenu()) {
        details.roles = interaction.roles.map(role => ({
            name: role.name,
            id: role.id
        }));
    }
    else if (interaction.isUserSelectMenu()) {
        details.users = interaction.users.map(user => ({
            username: user.username,
            id: user.id
        }));
    }
    else if (interaction.isMentionableSelectMenu()) {
        details.mentionables = interaction.members.map(member => ({
            username: member.user.username,
            id: member.id
        }));
    }

    return details;
};

const logPrefixCommand = (message) => {

    const { author, content, guild, channel } = message;
    const timestamp = new Date().toISOString();
    
    const logData = {
        timestamp,
        user: {
            username: author.username,
            id: author.id,
            tag: author.tag
        },
        server: guild ? {
            name: guild.name,
            id: guild.id
        } : null,
        channel: channel ? {
            name: channel.name,
            id: channel.id,
            type: channel.type
        } : null,
        actionType: 'executed_prefix_command',
        details: content
    };

        const readableLog = `${author.tag} (${author.id}) executed command: ${content}`;
        info(readableLog);
};

const interactionLogger = (client) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            let actionType;
            let details;

            const isDeveloper = developerIds.includes(interaction.user.id);
            const isDevGuild = interaction.guild && devGuildIds.includes(interaction.guild.id);
            const command = client.commands.get(interaction.commandName);
            
            if (command) {
                if (!isDeveloper && command.devOnly) {
                    warn(`${interaction.user.tag} (${interaction.user.id}) attempted to execute a developer-only command: /${interaction.commandName}`);
                }

                if (!isDevGuild && command.guildOnly) {
                    warn(`${interaction.user.tag} (${interaction.user.id}) attempted to execute a guild-only command in an unauthorized server.`);
                }

                if (interaction.isChatInputCommand()) {
                    actionType = 'executed_slash_command';
                    details = getCommandDetails(interaction);
                }
                else if (interaction.isContextMenuCommand()) {
                    actionType = 'used_context_menu';
                    details = {
                        commandName: interaction.commandName,
                        targetType: interaction.targetType
                    };
                }
                else if (interaction.isButton()) {
                    actionType = 'clicked_button';
                    details = getComponentDetails(interaction);
                }
                else if (interaction.isStringSelectMenu()) {
                    actionType = 'used_string_select_menu';
                    details = getComponentDetails(interaction);
                }
                else if (interaction.isChannelSelectMenu()) {
                    actionType = 'used_channel_select_menu';
                    details = getComponentDetails(interaction);
                }
                else if (interaction.isRoleSelectMenu()) {
                    actionType = 'used_role_select_menu';
                    details = getComponentDetails(interaction);
                }
                else if (interaction.isUserSelectMenu()) {
                    actionType = 'used_user_select_menu';
                    details = getComponentDetails(interaction);
                }
                else if (interaction.isMentionableSelectMenu()) {
                    actionType = 'used_mentionable_select_menu';
                    details = getComponentDetails(interaction);
                }
                else if (interaction.isModalSubmit()) {
                    actionType = 'submitted_modal';
                    details = {
                        customId: interaction.customId,
                        components: interaction.components.map(row => ({
                            components: row.components.map(component => ({
                                customId: component.customId,
                                value: component.value,
                                type: component.type
                            }))
                        }))
                    };
                }
                else if (interaction.isAutocomplete()) {
                    actionType = 'used_autocomplete';
                    details = {
                        commandName: interaction.commandName,
                        focusedOption: {
                            name: interaction.focused,
                            value: interaction.options.getFocused()
                        }
                    };
                }
                else {
                    actionType = 'unknown_interaction';
                    details = {
                        type: interaction.type
                    };
                }
                
                createDetailedLog(interaction, actionType, details);
            }

        } catch (err) {
            error(`Error logging interaction: ${err.message}`);
            console.error(err);
        }
    });

    client.on('messageCreate', (message) => {
        if (message.author.bot) return;
    
        if (message.content.trim().startsWith(PREFIX) && message.content.length > PREFIX.length) {
            const commandName = message.content.slice(PREFIX.length).split(' ')[0];
            const command = client.commands.get(commandName);

            if (command) {
                logPrefixCommand(message);
            }
        }              
    });
};

module.exports = { interactionLogger };