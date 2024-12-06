const { Events } = require('discord.js');
const { info, warn, error, success, debug, deleted, updated, created, custom, startup, event, component, command, prefix, sql, mongodb, members, channels, roles  } = require('../utils/logs');

module.exports = {
    name: Events.ClientReady,
    execute(client) {
        debug(`Logged in as ${client.user.tag}!`);
        /*warn(`test`);
        info(`test`);
        success(`test`);
        error(`test`);
        deleted(`test`);
        updated(`test`);
        created(`test`);
        startup(`test`);
        command(`test`);
        event(`test`);
        component(`test`);
        prefix(`test`);
        sql(`test`);
        mongodb(`test`);
        members(`test`);
        channels(`test`);
        roles(`test`);*/
    }
};
