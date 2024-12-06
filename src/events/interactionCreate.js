const { InteractionType } = require('discord.js');
const CommandUtil = require('../utils/CommandUtil');
const commandUtil = new CommandUtil();

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (interaction.type !== InteractionType.ApplicationCommand) return;
        
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ 
                        content: 'This command no longer exists...', 
                        ephemeral: true 
                    });
                }
            } catch (error) {
                console.error('Error responding to unknown command:', error);
            }
            return;
        }

        try {
            await commandUtil.handleCommand(interaction, command);
        } catch (error) {
            console.error('Error in interaction create:', error);
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ 
                        content: 'There was an error while executing this command!', 
                        ephemeral: true 
                    });
                } else if (interaction.deferred) {
                    await interaction.followUp({ 
                        content: 'There was an error while executing this command!', 
                        ephemeral: true 
                    });
                }
            } catch (err) {
                console.error('Error sending error message:', err);
            }
        }
    }
};