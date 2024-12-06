const { WebhookClient, EmbedBuilder } = require('discord.js');
const { readFileSync } = require('fs');
const { join } = require('path');
const { info, success, warn, error } = require('./logs');
const config = require('../../config.json')

function WebhookUtil() {

  const webhookId = config.webhookId;
  const webhookToken = config.webhookToken;

  if (!webhookId || !webhookToken) {
    throw new Error("Webhook ID and Token are required! Check your config.json file.");
  }

  const webhook = new WebhookClient({ id: webhookId, token: webhookToken });

  async function sendMessage(content, options = {}) {
    if (!content) throw new Error("Content is required for the webhook message.");
    try {
      await webhook.send({
        content,
        username: options.username || 'Webhook Bot',
        avatarURL: options.avatarURL || null,
      });
      success('Webhook message sent successfully!');
    } catch (err) {
      error('Failed to send webhook message:', err);
    }
  }

  async function sendEmbed(embed, options = {}) {
    if (!(embed instanceof EmbedBuilder)) {
      throw new Error("Invalid embed object. Use EmbedBuilder to create embeds.");
    }
    try {
      await webhook.send({
        embeds: [embed],
        username: options.username || 'Webhook Bot',
        avatarURL: options.avatarURL || null,
      });
      success('Webhook embed sent successfully!');
    } catch (err) {
      error('Failed to send webhook embed:', err);
    }
  }

  return {
    sendMessage,
    sendEmbed,
  };
}

module.exports = { WebhookUtil };
