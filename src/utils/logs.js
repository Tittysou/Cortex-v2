const { inspect } = require('node:util');
const readline = require('readline');

function hexToAnsi(hex) {
    const rgb = hex.match(/.{2}/g).map(value => parseInt(value, 16));
    return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
}

function getTimestamp() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function formatMessage(message) {
    return typeof message === 'string' ? message : inspect(message, { depth: 3 });
}

class Logger {
    constructor(label, hexColor) {
        this.label = label;
        this.colorCode = hexToAnsi(hexColor);
    }

    log(message) {
        console.log(
            `${hexToAnsi('FFFFFF')}${getTimestamp()}\x1b[0m ` +
            `${this.colorCode}[${this.label}] ` +
            `${formatMessage(message)}\x1b[0m`
        );
    }

    async prompt(message) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question(
                `${hexToAnsi('FFFFFF')}${getTimestamp()}\x1b[0m ` +
                `${this.colorCode}[${this.label}] ${message}\x1b[0m: `,
                (input) => {
                    rl.close();
                    resolve(input);
                }
            );
        });
    }
}

const colors = {
    red: 'D98AAE',
    orange: 'FFD1B2',
    yellow: 'E5E5B5',
    green: '99FFCC',
    blue: 'CCE5FF',
    pink: 'FFCCE5',
    purple: 'D9B3FF',
    cyan: 'CCFFFF',
    white: 'FFFFFF',
    lgreen: '99FF99',
    teal: '99CCCC',
    terracotta: 'D9B28A',
    rosePink: 'FFB3CC',
    oceanBlue: '99CCFF',
    darkBlurple: '9C81D0',
    pastelLavender: 'D4A5C8',
    peach: 'FFCC99',
    mint: '99FFCC',
    lilac: 'D9B3FF',
    lavender: 'E5CCFF',
    pastelBlue: 'B3D9FF',
    pastelPurple: 'E5CCFF'
};

const logger = {
    info: new Logger('INFO', colors.yellow),
    warn: new Logger('WARN', colors.orange),
    error: new Logger('ERROR', colors.red),
    success: new Logger('SUCCESS', colors.green),
    debug: new Logger('DEBUG', colors.blue),
    deleted: new Logger('DELETED', colors.pink),
    updated: new Logger('UPDATED', colors.purple),
    created: new Logger('CREATED', colors.cyan),
    startup: new Logger('STARTUP', colors.lgreen),
    event: new Logger('EVENT', colors.teal),
    component: new Logger('COMP', colors.terracotta),
    command: new Logger('CMD', colors.rosePink),
    prefix: new Logger('PREFIX', colors.oceanBlue),
    sql: new Logger('SQL', colors.darkBlurple),
    mongodb: new Logger('MONGO', colors.pastelLavender),
    members: new Logger('MEMBERS', colors.peach),
    channels: new Logger('CHANNELS', colors.mint),
    roles: new Logger('ROLES', colors.lilac),
    utils: new Logger('UTILS', colors.lavender),
    shard: new Logger('SHARDING', colors.pastelPurple),
    inputlog: new Logger('INPUT', colors.pastelBlue),
};

module.exports = {
    info: (message) => logger.info.log(message),
    warn: (message) => logger.warn.log(message),
    error: (message) => logger.error.log(message),
    success: (message) => logger.success.log(message),
    debug: (message) => logger.debug.log(message),
    deleted: (message) => logger.deleted.log(message),
    updated: (message) => logger.updated.log(message),
    created: (message) => logger.created.log(message),
    startup: (message) => logger.startup.log(message),
    event: (message) => logger.event.log(message),
    component: (message) => logger.component.log(message),
    command: (message) => logger.command.log(message),
    prefix: (message) => logger.prefix.log(message),
    sql: (message) => logger.sql.log(message),
    mongodb: (message) => logger.mongodb.log(message),
    members: (message) => logger.members.log(message),
    channels: (message) => logger.channels.log(message),
    roles: (message) => logger.roles.log(message),
    utils: (message) => logger.utils.log(message),
    shard: (message) => logger.shard.log(message),
    inputlog: async (message) => await logger.inputlog.prompt(message),
    custom: (message, hexColor) => new Logger('CUSTOM', hexColor).log(message)
};
