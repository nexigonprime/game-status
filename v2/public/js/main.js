const serverList = document.getElementById('serverList');
const timerElement = document.getElementById('timer');
const notificationContainer = document.getElementById('notificationContainer');

let lastServerCount = 0;
let lastServerHash = '';

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadServers();
    setInterval(() => {
        updateServerData();
        updateRemainingTime();
    }, 120000);
    setInterval(updateRemainingTime, 1000);
    setupEventListeners();
    
    // Timer para atualização dos dados
    setInterval(async () => {
        await checkServerChanges();
        updateTimer();
    }, 2000);
});

// Configuração dos event listeners
function setupEventListeners() {
    document.getElementById('addServer').addEventListener('click', handleAddServer);
    document.getElementById('searchGame').addEventListener('keyup', filterGames);
}

// Funções de Login e Credenciais
async function carregarCredenciais() {
    try {
        const response = await fetch('./users.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar o JSON');
        }
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao carregar as credenciais.', 'error');
        return [];
    }
}

function showLoginModal() {
    return new Promise((resolve, reject) => {
        const modal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        const cancelButton = document.getElementById('cancelLogin');

        modal.style.display = 'block';

        cancelButton.onclick = () => {
            modal.style.display = 'none';
            reject(new Error('Login cancelado'));
        };

        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            modal.style.display = 'none';
            loginForm.reset();
            resolve({ username, password });
        };
    });
}

// Função principal de adicionar servidor
async function handleAddServer() {
    try {
        const credentials = await showLoginModal();
        const users = await carregarCredenciais();
        const user = users.find(u => u.username === credentials.username && u.password === credentials.password);

        if (!user) {
            showNotification('Usuário ou senha inválidos!', 'error');
            return;
        }

        const serverData = getServerFormData();
        if (!validateServerData(serverData)) return;

        await addServer(serverData);
    } catch (error) {
        if (error.message !== 'Login cancelado') {
            showNotification('Erro ao realizar operação.', 'error');
        }
    }
}

// Funções auxiliares para manipulação de servidor
function getServerFormData() {
    return {
        ip: document.getElementById('ip').value,
        port: document.getElementById('port').value,
        gameType: document.getElementById('gameType').value,
        webhook: document.getElementById('webhook').value
    };
}

function validateServerData(data) {
    if (!isValidIpOrDomain(data.ip)) {
        showNotification('IP ou domínio inválido! Por favor, insira um IP ou domínio válido.', 'error');
        return false;
    }
    if (data.port < 1 || data.port > 65535) {
        showNotification('Porta inválida! A porta deve estar entre 1 e 65535.', 'warning');
        return false;
    }
    return true;
}

async function addServer(data) {
    try {
        const response = await fetch('/add-server', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('Servidor adicionado com sucesso!', 'success', data.gameType);
            document.getElementById('serverForm').reset();
            
            // Força uma atualização completa da lista usando a função do serverList.js
            await window.loadServers(1);
        } else {
            throw new Error('Falha ao adicionar servidor');
        }
    } catch (error) {
        showNotification('Erro ao adicionar servidor.', 'error', data.gameType);
    }
}

// Funções de validação
function isValidIpOrDomain(input) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainPattern = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/;
    return ipPattern.test(input) || domainPattern.test(input);
}

// Funções de atualização e filtro
async function updateRemainingTime() {
    try {
        const response = await fetch('/remaining-time');
        const data = await response.json();
        timerElement.innerText = data.remainingTime;
    } catch (error) {
        console.error('Erro ao atualizar tempo:', error);
    }
}

function filterGames() {
    const input = document.getElementById('searchGame');
    const filter = input.value.toLowerCase();
    const select = document.getElementById('gameType');
    const options = select.getElementsByTagName('option');

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value) {
            const txtValue = option.textContent || option.innerText;
            option.style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

// Função para gerar um hash simples da lista de servidores
function generateServerHash(servers) {
    return servers.map(s => `${s.ip}:${s.port}`).sort().join('|');
}

// Função para verificar mudanças na lista de servidores
async function checkServerChanges() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/servers?t=${timestamp}`);
        const data = await response.json();
        
        const currentHash = generateServerHash(data.servers);
        
        // Se o número de servidores ou o hash mudou, recarrega a lista completa
        if (data.servers.length !== lastServerCount || currentHash !== lastServerHash) {
            lastServerCount = data.servers.length;
            lastServerHash = currentHash;
            
            // Recarrega a lista completa
            currentPage = 1;
            serverList.innerHTML = '';
            await loadServers();
            return;
        }
        
        // Se não houve mudança na lista, apenas atualiza os dados
        await updateServerData();
    } catch (error) {
        console.error('Erro ao verificar mudanças nos servidores:', error);
    }
}

// Exportar funções necessárias
window.filterGames = filterGames;
window.handleAddServer = handleAddServer;
window.addServer = addServer;
window.showLoginModal = showLoginModal;
window.carregarCredenciais = carregarCredenciais; 