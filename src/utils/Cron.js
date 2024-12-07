const cron = require('node-cron');
const { success, error } = require('./logs');

function convertToCron(time) {
    const match = time.match(/^(\d+)([smhdwMy]?)$/);
    if (!match) {
      throw new Error('Invalid time format');
    }
  
    const amount = parseInt(match[1], 10);
    const unit = match[2];
  
    switch (unit) {
      case 's':
        return `*/${amount} * * * * *`;
      case 'm':
        return `*/${amount} * * * *`;
      case 'h':
        return `0 */${amount} * * *`;
      case 'd':
        return `0 0 */${amount} * *`;
      case 'w':
        return `0 0 * * 0`
      case 'M':
        return `0 0 1 */${amount} *`;
      case 'y':
        return `0 0 1 1 */${amount}`;
      default:
        throw new Error('Invalid time format');
    }
}  

function simplecron(time, task) {
  try {
    const cronExpression = convertToCron(time);
    cron.schedule(cronExpression, task);
    success(`Task scheduled: ${time}`);
  } catch (err) {
    error(`Error scheduling task: ${err}`);
  }
}

module.exports = { simplecron };
