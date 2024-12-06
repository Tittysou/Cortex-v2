module.exports = {
    customId: 'primary-test',
    async execute(interaction) {
        await interaction.reply({
            content: 'Primary button clicked!',
            ephemeral: true
        });
    }
};