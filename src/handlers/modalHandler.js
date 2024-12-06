const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const path = require('path');
const { error } = require('../utils/logs');

class ModalHandler {
    constructor(client) {
        this.client = client;
        this.modals = new Collection();
    }

    async loadModals() {
        const modalsPath = path.join(__dirname, '../components/modals');
        try {
            const files = await readdir(modalsPath);
            const modalFiles = files.filter(file => file.endsWith('.js'));

            for (const file of modalFiles) {
                const modal = require(path.join(modalsPath, file));
                this.modals.set(modal.customId, modal);
            }
        } catch (error) {
        }
    }

    async handleModal(interaction) {
        const modal = this.modals.get(interaction.customId);
        if (!modal) return;

        try {
            await modal.execute(interaction, this.client);
        } catch (err) {
            error(`Error executing modal ${interaction.customId}:`, err);
            await interaction.reply({
                content: 'There was an error processing your submission!',
                ephemeral: true
            }).catch(() => {});
        }
    }
}

module.exports = ModalHandler;