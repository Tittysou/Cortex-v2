module.exports = {
    customId: 'danger-test',
    async execute(interaction) {
        await interaction.reply({
            content: 'Danger button clicked',
            ephemeral: true
        });
    }
};