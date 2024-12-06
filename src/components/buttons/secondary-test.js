module.exports = {
    customId: 'secondary-test',
    async execute(interaction) {
        await interaction.reply({
            content: 'Secondary button clicked!',
            ephemeral: true
        });
    }
};