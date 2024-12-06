const fs = require('fs').promises;
const path = require('path');
const readline = require('node:readline');
const { exec } = require('node:child_process');
const config = require('../../config.json');
const { success, warn, error, startup } = require('../utils/logs');

const inputlog = async (prompt) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let lastPaste = 0;
    const PASTE_DELAY = 100;
    let inputValue = '';

    process.stdin.on('keypress', (_, key) => {
        if (key && key.ctrl && key.name === 'v') {
            const now = Date.now();
            if (now - lastPaste < PASTE_DELAY) return;
            lastPaste = now;

            exec('powershell.exe Get-Clipboard', (error, stdout) => {
                if (!error) {
                    const content = stdout.trim();
                    if (inputValue.length > 0 && !inputValue.endsWith(',')) {
                        inputValue += ', '; 
                    }
                    inputValue += content; 

                    rl.write(null, { ctrl: true, name: 'u' });
                    rl.write(inputValue);
                }
            });
        }
    });

    try {
        return await new Promise((resolve) => {
            rl.question(`${prompt}: `, (answer) => {
                inputValue = answer.trim();
                resolve(answer.trim());
            });
        });
    } finally {
        rl.close();
    }
};

const checkConfig = async () => {
    let configModified = false;
    const configPath = path.resolve(__dirname, '../../config.json');
    const requiredFields = {
        token: "bot token",
        id: "bot ID",
        devGuild: "developer guild ID",
        developerIds: "developer ID(s)",
        prefix: "command prefix",
        mongoDBUrl: "mongo URL",
        webhookToken: "webhook token",
        webhookId: "webhook ID"
    };

    for (const [field, description] of Object.entries(requiredFields)) {
        if (!config[field] || (Array.isArray(config[field]) && config[field].length === 0)) {
            warn(`Missing or empty ${description}.`);
            const value = await inputlog(`Please enter your ${description}`);

            if (field === 'developerIds') {
                if (value.includes(',')) {
                    config[field] = value.split(',').map(id => id.trim());
                } else {
                    config[field] = [value.trim()];
                }
            } else {
                config[field] = value;
            }
            configModified = true;
        }
    }

    if (configModified) {
        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 4));
            success('Configuration updated successfully. Continuing startup...');
        } catch (err) {
            return error(`Failed to save configuration: ${err.message}`);
        }
    }

    startup(`Configuration check completed. Loading remaining components...`);
};

module.exports = checkConfig;
