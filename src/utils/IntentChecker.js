const { info, warn } = require('./logs');
const { GatewayIntentBits } = require('discord-api-types/v10');

const REQUIRED_INTENTS = {
    'guildCreate': GatewayIntentBits.Guilds,
    'guildUpdate': GatewayIntentBits.Guilds,
    'guildDelete': GatewayIntentBits.Guilds,
    'channelCreate': GatewayIntentBits.Guilds,
    'channelUpdate': GatewayIntentBits.Guilds,
    'channelDelete': GatewayIntentBits.Guilds,
    'channelPinsUpdate': GatewayIntentBits.Guilds,
    'threadCreate': GatewayIntentBits.Guilds,
    'threadUpdate': GatewayIntentBits.Guilds,
    'threadDelete': GatewayIntentBits.Guilds,
    'threadListSync': GatewayIntentBits.Guilds,
    'threadMemberUpdate': GatewayIntentBits.Guilds,
    'threadMembersUpdate': GatewayIntentBits.Guilds,
    'stageInstanceCreate': GatewayIntentBits.Guilds,
    'stageInstanceUpdate': GatewayIntentBits.Guilds,
    'stageInstanceDelete': GatewayIntentBits.Guilds,
    'guildMemberAdd': GatewayIntentBits.GuildMembers,
    'guildMemberUpdate': GatewayIntentBits.GuildMembers,
    'guildMemberRemove': GatewayIntentBits.GuildMembers,
    'guildAuditLogEntryCreate': GatewayIntentBits.GuildModeration,
    'guildBanAdd': GatewayIntentBits.GuildModeration,
    'guildBanRemove': GatewayIntentBits.GuildModeration,
    'guildEmojisUpdate': GatewayIntentBits.GuildEmojisAndStickers,
    'guildStickersUpdate': GatewayIntentBits.GuildEmojisAndStickers,
    'webhooksUpdate': GatewayIntentBits.GuildWebhooks,
    'inviteCreate': GatewayIntentBits.GuildInvites,
    'inviteDelete': GatewayIntentBits.GuildInvites,
    'voiceStateUpdate': GatewayIntentBits.GuildVoiceStates,
    'presenceUpdate': GatewayIntentBits.GuildPresences,
    'messageCreate': GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
    'messageUpdate': GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
    'messageDelete': GatewayIntentBits.GuildMessages | GatewayIntentBits.DirectMessages,
    'messageDeleteBulk': GatewayIntentBits.GuildMessages,
    'messageReactionAdd': GatewayIntentBits.GuildMessageReactions,
    'messageReactionRemove': GatewayIntentBits.GuildMessageReactions,
    'messageReactionRemoveAll': GatewayIntentBits.GuildMessageReactions,
    'messageReactionRemoveEmoji': GatewayIntentBits.GuildMessageReactions,
    'typingStart': GatewayIntentBits.GuildMessageTyping,
    'guildScheduledEventCreate': GatewayIntentBits.GuildScheduledEvents,
    'guildScheduledEventUpdate': GatewayIntentBits.GuildScheduledEvents,
    'guildScheduledEventDelete': GatewayIntentBits.GuildScheduledEvents,
    'guildScheduledEventUserAdd': GatewayIntentBits.GuildScheduledEvents,
    'guildScheduledEventUserRemove': GatewayIntentBits.GuildScheduledEvents,
    'autoModerationRuleCreate': GatewayIntentBits.AutoModerationConfiguration,
    'autoModerationRuleUpdate': GatewayIntentBits.AutoModerationConfiguration,
    'autoModerationRuleDelete': GatewayIntentBits.AutoModerationConfiguration,
    'autoModerationActionExecution': GatewayIntentBits.AutoModerationExecution,
};

const checkIntents = (client) => {
    const enabledIntents = client.options.intents;
    const missingIntents = [];

    for (const [event, intent] of Object.entries(REQUIRED_INTENTS)) {
        if (!(enabledIntents & intent)) {
            missingIntents.push(event);
        }
    }

    if (missingIntents.length > 0) {
        warn(`Missing intents for events: ${missingIntents.join(', ')}.`);
    } else {
        info('All required intents are enabled.');
    }
};

module.exports = { checkIntents };
