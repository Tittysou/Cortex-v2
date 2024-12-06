const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const path = require('path');
const { error } = require('../utils/logs');

class SelectMenuHandler {
    constructor(client) {
        this.client = client;
        this.selectMenus = new Collection();
    }

    async loadSelectMenus() {
        const selectMenusPath = path.join(__dirname, '../components/menus');
        try {
            const files = await readdir(selectMenusPath);
            const menuFiles = files.filter(file => file.endsWith('.js'));

            for (const file of menuFiles) {
                const menu = require(path.join(selectMenusPath, file));
                this.selectMenus.set(menu.customId, menu);
            }
        } catch (error) {
        }
    }

    async handleSelectMenu(interaction) {
        const menu = this.selectMenus.get(interaction.customId);
        if (!menu) return;

        try {
            await menu.execute(interaction, this.client);
        } catch (err) {
            error(`Error executing select menu ${interaction.customId}:`, err);
            await interaction.reply({
                content: 'There was an error executing this select menu!',
                ephemeral: true
            }).catch(() => {});
        }
    }
}

module.exports = SelectMenuHandler;