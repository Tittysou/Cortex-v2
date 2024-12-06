const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Get the bot\'s ping.',
    async execute(message) {
        const botLatency = Date.now() - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        const infoEmbed = new EmbedBuilder()
            .setColor('DarkVividPink')
            .setTitle('Pong!')
            .setDescription(`🏓 Bot latency: **${botLatency}ms**\n💓 API latency: **${apiLatency}ms**`);

        await message.reply({ embeds: [infoEmbed], content: '' });
    }
};
