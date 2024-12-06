const { ActivityType } = require('discord.js');
const { info, success, warn, error } = require('./logs');

function startActivityCycle(client, activities, interval = 10000) {
    let currentIndex = 0;
    let activityInterval = null;

    function updateActivity() {
        if (activities.length > 0) {
            const activity = activities[currentIndex];
            client.user.setActivity(activity.name, { type: activity.type });
            currentIndex = (currentIndex + 1) % activities.length;
        }
    }

    activityInterval = setInterval(updateActivity, interval);
    updateActivity();

    const originalPush = activities.push;
    activities.push = function (...args) {
        const result = originalPush.apply(this, args);
        restartActivityCycle();
        return result;
    };

    const originalSplice = activities.splice;
    activities.splice = function (start, deleteCount, ...items) {
        const result = originalSplice.apply(this, arguments);
        restartActivityCycle();
        return result;
    };

    function restartActivityCycle() {
        clearInterval(activityInterval);
        warn('Activity list changed. Restarting activity cycle...');
        activityInterval = setInterval(updateActivity, interval);
    }

    return activityInterval;
}

function addActivity(activities, name, type) {
    activities.push({ name, type });
    success(`Added new activity: ${type} ${name}`);
    return activities;
}

function removeActivity(activities, name) {
    const index = activities.findIndex(activity => activity.name === name);
    if (index !== -1) {
        activities.splice(index, 1);
        warn(`Removed activity: ${name}`);
    } else {
        info(`Activity not found: ${name}`);
    }
    return activities;
}

module.exports = { startActivityCycle, addActivity, removeActivity };
