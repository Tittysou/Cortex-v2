const { hiddenReply, visibleReply, sendMessage } = require('../utils/ephemeral');

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: ["2"],
    permissions: ['SendMessages'],
    devOnly: false,
    devGuild: false,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply(hiddenReply({
            content: `Only you can see this!`
        }));    
    }
};