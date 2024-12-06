const { Collection, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');
const { info, warn } = require('./logs');

class CommandUtil {
    constructor() {
        this.cooldowns = new Collection();
    }

    async handleCommand(interaction, command) {
        try {
            if (command.devOnly && !this.isDevUser(interaction.user.id)) {
                return await interaction.reply({
                    content: 'This command is only available to developers.',
                    ephemeral: true
                });
            }

            const missingPermissions = this.checkPermissions(interaction, command.permissions);
            if (missingPermissions.length > 0) {
                warn(`${interaction.user.tag} (${interaction.user.id}) attempted to use a command but is missing the following permissions: ${missingPermissions.join(', ')}`);
                return await interaction.reply({
                    content: `You need the following permissions to use this command: ${missingPermissions.join(', ')}`,
                    ephemeral: true
                });
            }

            if (command.cooldown) {
                const cooldownResult = this.handleCooldown(interaction, command);
                if (cooldownResult.onCooldown) {
                    return await interaction.reply({
                        content: `Please wait ${cooldownResult.timeLeft} seconds before using this command again.`,
                        ephemeral: true
                    });
                }
            }

            if (command.devGuild && !this.isDevGuild(interaction.guild.id)) {
                return await interaction.reply({
                    content: 'This command is only available in the developer guild.',
                    ephemeral: true
                });
            }

            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${command.data.name}:`, error);
            
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    content: 'An error occurred while executing that command.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'An error occurred while executing that command.',
                    ephemeral: true
                });
            }
        }
    }

    isDevUser(userId) {
        return config.developerIds.includes(userId);
    }

    isDevGuild(guildId) {
        return config.devGuild.includes(guildId);
    }

    checkPermissions(interaction, requiredPermissions = []) {
        const missingPermissions = [];
        const permissions = PermissionsBitField.Flags;
    
        if (!Array.isArray(requiredPermissions)) {
            console.warn("Expected 'requiredPermissions' to be an array, received:", typeof requiredPermissions);
            return ['Invalid Permissions Format'];
        }
    
        for (const permission of requiredPermissions) {
            if (!interaction.member.permissions.has(permissions[permission])) {
                missingPermissions.push(permission);
            }
        }
    
        return missingPermissions;
    }
    

    handleCooldown(interaction, command) {
        const cooldownSeconds = parseInt(command.cooldown[0]);
        if (!this.cooldowns.has(command.data.name)) {
            this.cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.data.name);
        const cooldownAmount = cooldownSeconds * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                return { onCooldown: true, timeLeft };
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        return { onCooldown: false };
    }
}

module.exports = CommandUtil;