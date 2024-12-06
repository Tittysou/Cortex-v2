const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'info',
    description: 'Get the info on a message',
    async execute(message, args) {
        if (args.length > 0) {

            const messageData = JSON.stringify(message, null, 2);

            const truncatedMessageData = messageData.length > 4096
                ? `${messageData.slice(0, 4093)}...`
                : messageData;

            const infoEmbed = new EmbedBuilder()
                .setColor('DarkVividPink')
                .setTitle('Message Data')
                .setDescription(`\`\`\`json\n${truncatedMessageData}\n\`\`\``);
    
            await message.reply({ embeds: [infoEmbed] });
        } else {
            await message.reply('Please provide a message ID.');
        }
    },
};
