const { Events } = require('discord.js');
const { Client, ActivityType } = require('discord.js');
const { startActivityCycle, addActivity, removeActivity } = require('../utils/Activity');
const { info, success, warn, error, debug } = require('../utils/logs');

module.exports = {
    name: Events.ClientReady,
    execute(client) {
        let activities = [
            { name: 'Over Activity 1', type: ActivityType.Watching },
            { name: 'Activity 2', type: ActivityType.Playing },
            { name: 'To Activity 3', type: ActivityType.Listening },
        ];

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


        //                           array     time
        startActivityCycle(client, activities, 5000, (onChangeCallback) => {
        });
    }
};
