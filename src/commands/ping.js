const { hiddenReply } = require('../utils/ephemeral');
const { WebhookUtil } = require('../utils/WebhookUtil');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: ["2"],
    permissions: ['SendMessages'],
    devOnly: false,
    devGuild: false,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Optional message to send via webhook')
                .setRequired(false)
        ),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        if (message) {
            const webhook = WebhookUtil();
            await webhook.sendMessage(message, {
                username: 'Cortex Webhook',
                avatarURL: 'https://example.com/avatar.png',
            });
            await interaction.reply(hiddenReply({
                content: `Message sent to the webhook: "${message}"`
            }));
        } else {
            await interaction.reply(hiddenReply({
                content: `Only you can see this!`
            }));
        }
    }
};
