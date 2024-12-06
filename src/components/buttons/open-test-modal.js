const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'open-test-modal',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('test-modal')
            .setTitle('Test Modal');

        const shortInput = new TextInputBuilder()
            .setCustomId('short-input')
            .setLabel('Short Input')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter some short text')
            .setRequired(true)
            .setMaxLength(100);

        const longInput = new TextInputBuilder()
            .setCustomId('long-input')
            .setLabel('Long Input')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter some longer text')
            .setRequired(false)
            .setMaxLength(1000);

        const firstRow = new ActionRowBuilder().addComponents(shortInput);
        const secondRow = new ActionRowBuilder().addComponents(longInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    }
};