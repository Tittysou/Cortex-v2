module.exports = {
    customId: 'test-modal',
    async execute(interaction) {
        const shortInput = interaction.fields.getTextInputValue('short-input');
        const longInput = interaction.fields.getTextInputValue('long-input');

        const embed = {
            title: 'Modal Submission',
            fields: [
                {
                    name: 'Short Input',
                    value: shortInput || 'Not provided.'
                },
                {
                    name: 'Long Input',
                    value: longInput || 'Not provided.'
                }
            ],
            color: 0x00ff00,
            timestamp: new Date()
        };

        await interaction.reply({
            content: 'Modal submitted!',
            embeds: [embed],
            ephemeral: true
        });
    }
};