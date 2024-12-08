const path = require('path');

function normalizePath(filePath) {
    return path.normalize(filePath);
}

function joinPath(...segments) {
    return path.join(...segments);
}

function resolvePath(filePath) {
    return path.resolve(filePath);
}

module.exports = { normalizePath, joinPath, resolvePath };
