const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const path = require('path');
const { error } = require('../utils/logs');


class ButtonHandler {
    constructor(client) {
        this.client = client;
        this.buttons = new Collection();
    }

    async loadButtons() {
        const buttonsPath = path.join(__dirname, '../components/buttons');
        try {
            const files = await readdir(buttonsPath);
            const buttonFiles = files.filter(file => file.endsWith('.js'));

            for (const file of buttonFiles) {
                const button = require(path.join(buttonsPath, file));
                this.buttons.set(button.customId, button);
            }
        } catch (error) {
        }
    }

    async handleButton(interaction) {
        const button = this.buttons.get(interaction.customId);
        if (!button) return;

        try {
            await button.execute(interaction, this.client);
        } catch (err) {
            error(`Error executing button ${interaction.customId}:`, err);
            await interaction.reply({
                content: 'There was an error executing this button!',
                ephemeral: true
            }).catch(() => {});
        }
    }
}

module.exports = ButtonHandler;