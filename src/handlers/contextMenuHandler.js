const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const path = require('path');
const { error } = require('../utils/logs');

class ContextMenuHandler {
    constructor(client) {
        this.client = client;
        this.contextMenus = new Collection();
    }

    async loadContextMenus() {
        const contextMenusPath = path.join(__dirname, '../components/context-menus');
        try {
            const files = await readdir(contextMenusPath);
            const menuFiles = files.filter(file => file.endsWith('.js'));

            for (const file of menuFiles) {
                const menu = require(path.join(contextMenusPath, file));
                this.contextMenus.set(menu.name, menu);
            }
        } catch (error) {
        }
    }

    async handleContextMenu(interaction) {
        const menu = this.contextMenus.get(interaction.commandName);
        if (!menu) return;

        try {
            await menu.execute(interaction, this.client);
        } catch (err) {
            error(`Error executing context menu ${interaction.commandName}:`, err);
            await interaction.reply({
                content: 'There was an error executing this context menu!',
                ephemeral: true
            }).catch(() => {});
        }
    }
}

module.exports = ContextMenuHandler;