const fs = require('fs');
const path = require('path');
const { info, warn, error, success, component } = require('../utils/logs');

const componentDirectories = [
    path.join(__dirname, '../components/modals'),
    path.join(__dirname, '../components/menus'),
    path.join(__dirname, '../components/buttons')
];

const loadComponent = (client, directory, filename) => {
    try {
        delete require.cache[require.resolve(path.join(directory, filename))];
        const component = require(path.join(directory, filename));

        if (component && component.customId) {
            client.components.set(component.customId, component);
            return true;
        } else {
            warn(`Skipped invalid or empty component in ${filename}`);
            return false;
        }
    } catch (err) {
        error(`Failed to load component from ${filename} ${err}`);
        return false;
    }
};

const loadComponents = (client) => {
    client.components = new Map();

    componentDirectories.forEach((directory) => {
        if (fs.existsSync(directory)) {
            const componentFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));

            componentFiles.forEach((file) => {
                loadComponent(client, directory, file);
            });
        } else {
            warn(`Directory not found: ${directory}`);
        }
    });

    component(`Loaded ${client.components.size} component(s).`);
};

const watchComponents = (client) => {
    componentDirectories.forEach((directory) => {
        if (fs.existsSync(directory)) {
            fs.watch(directory, (eventType, filename) => {
                if (filename && filename.endsWith('.js')) {
                    success(`Detected ${eventType} in component: ${filename}`);
                    loadComponent(client, directory, filename);
                }
            });
        }
    });
};

const initializeComponents = (client) => {
    loadComponents(client);
    watchComponents(client);
};

module.exports = { initializeComponents };
