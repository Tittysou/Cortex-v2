const ButtonHandler = require('./buttonHandler');
const SelectMenuHandler = require('./selectMenuHandler');
const ModalHandler = require('./modalHandler');
const ContextMenuHandler = require('./contextMenuHandler');
const { error } = require('../utils/logs');


class ComponentHandlers {
    constructor(client) {
        this.client = client;
        this.buttonHandler = new ButtonHandler(client);
        this.selectMenuHandler = new SelectMenuHandler(client);
        this.modalHandler = new ModalHandler(client);
        this.contextMenuHandler = new ContextMenuHandler(client);
    }

    async loadAll() {
        await Promise.all([
            this.buttonHandler.loadButtons(),
            this.selectMenuHandler.loadSelectMenus(),
            this.modalHandler.loadModals(),
            this.contextMenuHandler.loadContextMenus()
        ]);
    }

    registerHandlers() {
        this.client.on('interactionCreate', async (interaction) => {
            try {
                if (interaction.isButton()) {
                    await this.buttonHandler.handleButton(interaction);
                }
                else if (interaction.isAnySelectMenu()) {
                    await this.selectMenuHandler.handleSelectMenu(interaction);
                }
                else if (interaction.isModalSubmit()) {
                    await this.modalHandler.handleModal(interaction);
                }
                else if (interaction.isContextMenuCommand()) {
                    await this.contextMenuHandler.handleContextMenu(interaction);
                }
            } catch (err) {
                error('Error handling interaction:', err);
            }
        });
    }
}

module.exports = ComponentHandlers;