const fs = require('fs');
const path = require('path');
const { info } = require('./logs');

const IGNORED_FILES = ['node_modules', 'package-lock.json', 'package.json'];

const countLinesInFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.split('\n').length;
};

const countTotalLines = (directory) => {
    let totalLines = 0;

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isDirectory() && !IGNORED_FILES.includes(file.name)) {
            totalLines += countTotalLines(filePath);
        } else if (file.isFile() && !IGNORED_FILES.includes(file.name)) {
            totalLines += countLinesInFile(filePath);
        }
    }

    return totalLines;
};

const logTotalLines = () => {
    const totalLines = countTotalLines(process.cwd());
    info(`Total lines loaded: ${totalLines}.`);
};

module.exports = { logTotalLines };