function hiddenReply(options) {
  return {
    ...options,
    ephemeral: true,
  };
}

function visibleReply(options) {
  return {
    ...options,
    ephemeral: false,
  };
}

function sendMessage(options) {
  return options;
}

function hiddenFollowUp(options) {
  return {
    ...options,
    ephemeral: true,
  };
}

function visibleFollowUp(options) {
  return {
    ...options,
    ephemeral: false,
  };
}

module.exports = {
  hiddenReply,
  visibleReply,
  sendMessage,
  hiddenFollowUp,
  visibleFollowUp,
};

// examples
/*
await interaction.reply(
  hiddenReply({
    content: "Only you can see this!",
  })
);

// With embeds and components
await interaction.reply(
  hiddenReply({
    content: "Hidden message",
    embeds: [embed],
    components: [row],
  })
);

// For deferred replies
await interaction.deferReply({ ephemeral: true });
await interaction.followUp(
  hiddenFollowUp({
    content: "This is a follow up",
  })
);

// Regular channel message
await interaction.channel?.send(
  sendMessage({
    content: "Everyone can see this",
  })
); */
