const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "status", // Nome do comando
    description: "Mostra o status dos servidores.", // Descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    

    run: async (client, interaction) => {
        // Caminho para o arquivo cache.json
        const cachePath = path.join(__dirname, '..', '..', 'cache.json');
        
        // Lê o arquivo cache.json
        let cache;
        try {
            cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        } catch (error) {
            console.error('Erro ao ler cache.json:', error);
            return interaction.reply({
                content: 'Erro ao acessar a lista de servidores.',
                ephemeral: true
            });
        }

        const servers = cache.servers;

        if (servers.length === 0) {
            return interaction.reply({
                content: 'Nenhum servidor encontrado.',
                ephemeral: true
            });
        }

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId('select_server')
                    .setPlaceholder('Selecione um servidor')
                    .addOptions(
                        servers.map(server => ({
                            label: `${server.ip}:${server.port}`,
                            description: `${server.online ? '🟢 Online' : '🔴 Offline'}`,
                            value: `${server.ip}:${server.port}`
                        }))
                    )
            );

        await interaction.reply({
            content: 'Selecione um servidor para ver os detalhes:',
            components: [row],
            ephemeral: true
        });
    },

    // Handler do menu de seleção
    async selectMenu(client, interaction) {
        if (interaction.customId === 'select_server') {
            const selectedValue = interaction.values[0];
            const [ip, port] = selectedValue.split(':');

            let cache;
            try {
                cache = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'cache.json'), 'utf-8'));
            } catch (error) {
                return interaction.update({
                    content: 'Erro ao acessar a lista de servidores.',
                    components: [],
                    ephemeral: true
                });
            }

            const server = cache.servers.find(s => s.ip === ip && s.port === parseInt(port));

            if (!server) {
                return interaction.update({
                    content: 'Servidor não encontrado.',
                    components: [],
                    ephemeral: true
                });
            }

            const embed = {
                title: server.name || 'Servidor Desconhecido',
                color: server.online ? 3066993 : 15158332,
                fields: [
                    {
                        name: 'IP',
                        value: `${server.ip}:${server.port}`,
                        inline: true
                    },
                    {
                        name: 'Tipo',
                        value: server.type || 'Desconhecido',
                        inline: true
                    },
                    {
                        name: 'Jogadores',
                        value: `${server.players} / ${server.maxPlayers}`,
                        inline: true
                    },
                    {
                        name: 'Jogadores Online',
                        value: Array.isArray(server.playerNames) 
                            ? server.playerNames.join(', ') 
                            : server.playerNames || 'Nenhum jogador online',
                        inline: true
                    },
                    {
                        name: 'Status',
                        value: server.online ? '🟢 Online' : '🔴 Offline',
                        inline: true
                    },
                    {
                        name: 'Ping',
                        value: server.ping ? `${server.ping} ms` : 'N/A',
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            };

            await interaction.update({
                content: null,
                embeds: [embed],
                components: [],
                ephemeral: true
            });
        }
    }
};
