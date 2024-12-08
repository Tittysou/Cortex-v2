const { info } = require("./logs");

async function paginate(interaction, pages, timeout = 60000) {
    if (!Array.isArray(pages) || pages.length === 0) {
        throw new Error("The 'pages' array is either undefined or empty.");
    }

    let currentPage = 0;

    const msg = await interaction.reply({
        content: pages[currentPage],
        fetchReply: true
    });

    if (pages.length <= 1) return;

    await msg.react('⬅️');
    await msg.react('➡️');

    const filter = (reaction, user) =>
        ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;

    const collector = msg.createReactionCollector({ filter, time: timeout });

    collector.on('collect', (reaction) => {
        reaction.users.remove(interaction.user);

        if (reaction.emoji.name === '⬅️' && currentPage > 0) currentPage--;
        else if (reaction.emoji.name === '➡️' && currentPage < pages.length - 1) currentPage++;

        msg.edit({ content: pages[currentPage] });
    });

    collector.on('end', () => msg.reactions.removeAll().catch(() => null));
}

info('Pagination loaded.');

module.exports = { paginate };
