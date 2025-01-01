const { Events, ActivityType } = require('discord.js');
const { startActivityCycle } = require('../utils/Activity');
const { debug } = require('../utils/logs');

module.exports = {
    name: Events.ClientReady,
    execute(client) {
        client.csize = () => {
            let totalCommands = 0;

            client.commands.forEach(command => {
                totalCommands += 1;
                if (command.data.toJSON().options) {
                    command.data.toJSON().options.forEach(option => {
                        if (option.type === 1) {
                            totalCommands += 1;
                        }
                    });
                }
            });

            return totalCommands;
        };

        let activities = [
            { name: 'Over Activity 1', type: ActivityType.Watching },
            { name: 'Activity 2', type: ActivityType.Playing },
            { name: 'To Activity 3', type: ActivityType.Listening },
        ];

        debug(`Logged in as ${client.user.tag}!`);

        startActivityCycle(client, activities, 5000, (onChangeCallback) => {
        });
    }
};
