const Discord = require("discord.js")

const config = require("./config.json")

const client = new Discord.Client({ 
  intents: [ 
    Discord.GatewayIntentBits.Guilds
  ]
});

module.exports = client

client.on('interactionCreate', async (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply(`Error`);
    interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);
    cmd.run(client, interaction);
  }

  // Adiciona o handler para menus de seleção
  if (interaction.isStringSelectMenu()) {
    const cmd = client.slashCommands.get('status');
    if (cmd && cmd.selectMenu) {
      await cmd.selectMenu(client, interaction);
    }
  }
});

client.on('ready', () => {
  console.log(`🔥 Estou online em ${client.user.username}!`)
})

client.slashCommands = new Discord.Collection()

require('./handler')(client)

client.login(config.token)