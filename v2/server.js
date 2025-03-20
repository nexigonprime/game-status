const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dig = require('./dig');
const { sendToDiscord } = require('./discordWebhook');

const app = express();
const port = 3000;
const cacheFilePath = path.join(__dirname, 'cache.json');
const serversFilePath = path.join(__dirname, 'servers.json');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Inicializa o cache
let cache = { servers: [], lastUpdated: Date.now() };
let updateTimer;

// Função para carregar o cache do arquivo
function loadCache() {
    if (fs.existsSync(cacheFilePath)) {
        cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
    }
}

// Função para salvar o cache no arquivo
function saveCache() {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
}

// Função para carregar servidores do arquivo servers.json
function loadServers() {
    if (fs.existsSync(serversFilePath)) {
        return JSON.parse(fs.readFileSync(serversFilePath, 'utf-8'));
    }
    return [];
}

// Função para salvar servidores no arquivo servers.json
function saveServers(servers) {
    fs.writeFileSync(serversFilePath, JSON.stringify(servers, null, 2));
}

// Função para atualizar o cache
async function updateCache() {
    const servers = loadServers();
    const statuses = await dig.getCachedServerStatuses(servers);

    cache = {
        servers: statuses,
        lastUpdated: Date.now()
    };

    saveCache();
    console.log("Cache atualizado:", cache);

    // Envia notificação para o Discord para todos os servidores com webhook
    for (const server of servers) {
        if (server.webhook) {
            await sendToDiscord(server.webhook, statuses.find(s => s.ip === server.ip && s.port === parseInt(port)));
        }
    }
}

// Função para resetar o timer
function resetUpdateTimer() {
    if (updateTimer) {
        clearInterval(updateTimer);
    }
    updateTimer = setInterval(updateCache, 120 * 1000);
}

// Inicia o timer inicial
resetUpdateTimer();

// Rota para adicionar um servidor
app.post('/add-server', async (req, res) => {
    const { ip, port, gameType, webhook } = req.body;

    const servers = loadServers();
    const newServer = dig.addServer(ip, port, gameType, webhook);
    servers.push(newServer);

    saveServers(servers);
    res.json({ message: 'Servidor adicionado com sucesso!', server: newServer });

    // Atualiza o cache e reseta o timer
    await updateCache();
    resetUpdateTimer();
});

// Rota para remover um servidor
app.post('/remove-server', async (req, res) => {
    const { ip, port } = req.body;
    
    try {
        let servers = loadServers();
        const initialLength = servers.length;
        
        // Filtra os servidores, removendo o que corresponde ao IP e porta
        servers = servers.filter(server => !(server.ip === ip && server.port === parseInt(port)));
        
        // Verifica se algum servidor foi removido
        if (servers.length === initialLength) {
            return res.status(404).json({ message: 'Servidor não encontrado.' });
        }
        
        // Salva a nova lista de servidores
        saveServers(servers);
        
        // Atualiza o cache e reseta o timer
        await updateCache();
        resetUpdateTimer();
        
        res.json({ message: 'Servidor removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover servidor:', error);
        res.status(500).json({ message: 'Erro ao remover servidor.' });
    }
});

// Rota para obter o cache
app.get('/servers', (req, res) => {
    res.json(cache);
});

// Rota para servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Função para retornar o tempo restante para a próxima atualização
app.get('/remaining-time', (req, res) => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - cache.lastUpdated;
    const remainingTime = Math.max(120 - Math.floor(elapsedTime / 1000), 0);
    res.json({ remainingTime });
});

// Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    loadCache();
    updateCache();
});