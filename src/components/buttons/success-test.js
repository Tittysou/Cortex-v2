module.exports = {
    customId: 'success-test',
    async execute(interaction) {
        await interaction.reply({
            content: 'Success button clicked!',
            ephemeral: true
        });
    }
};