const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    StringSelectMenuBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    PermissionFlagsBits 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testcomp')
        .setDescription('Test various components'),
    async execute(interaction) {
        await interaction.deferReply();

        const buttonsRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary-test')
                    .setLabel('Primary')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('secondary-test')
                    .setLabel('Secondary')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('success-test')
                    .setLabel('Success')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('danger-test')
                    .setLabel('Danger')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setLabel('Link')
                    .setURL('https://discord.js.org')
                    .setStyle(ButtonStyle.Link)
            );

        const selectRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('test-select')
                    .setPlaceholder('Select an option')
                    .addOptions([
                        {
                            label: 'Option 1',
                            description: 'This is option 1',
                            value: 'option1',
                            emoji: '1️⃣'
                        },
                        {
                            label: 'Option 2',
                            description: 'This is option 2',
                            value: 'option2',
                            emoji: '2️⃣'
                        },
                        {
                            label: 'Option 3',
                            description: 'This is option 3',
                            value: 'option3',
                            emoji: '3️⃣'
                        }
                    ])
            );

        const modalTriggerRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('open-test-modal')
                    .setLabel('Open Modal')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.editReply({
            content: 'Test all components below:',
            components: [buttonsRow, selectRow, modalTriggerRow]
        });
    },

    async buttonHandler(interaction) {
        if (interaction.customId === 'open-test-modal') {
            const modal = new ModalBuilder()
                .setCustomId('testModal')
                .setTitle('Test Modal')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input1')
                            .setLabel('Input 1')
                            .setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('input2')
                            .setLabel('Input 2')
                            .setStyle(TextInputStyle.Paragraph)
                    )
                );

            await interaction.showModal(modal);
        }
    }
};
