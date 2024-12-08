const mongoose = require('mongoose');
const { debug, error, warn } = require('./logs');

const configureProcessHandlers = () => {
    process.on('uncaughtException', handleCriticalError);
    process.on('unhandledRejection', handleCriticalError);
    process.on('warning', logWarning);
    process.on('SIGINT', handleGracefulExit);
    process.on('SIGTERM', handleGracefulExit);
};

const handleCriticalError = (err) => {
    error(`Critical error encountered: ${err}`);
};

const logWarning = (warning) => {
    warn(`Process warning: ${warning.name} - ${warning.message}`);
};

module.exports = {
    configureProcessHandlers,
};
