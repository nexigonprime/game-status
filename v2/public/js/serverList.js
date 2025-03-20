let currentPage = 1;
const SERVERS_PER_PAGE = 10;

function createServerCard(server) {
    const card = document.createElement('div');
    card.className = 'server-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
        <div class="server-header">
            <div class="server-name">${server.name || 'Servidor sem nome'}</div>
            <span class="server-status ${server.online ? 'online' : 'offline'}">
                <span class="status-icon"></span>
                ${server.online ? 'Online' : 'Offline'}
            </span>
        </div>
        <div class="server-content">
            <div class="server-info">
                <div class="info-item">
                    <i class="fas fa-network-wired"></i>
                    <span class="info-label">IP:</span>
                    <span class="info-value">${server.ip}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-door-open"></i>
                    <span class="info-label">Porta:</span>
                    <span class="info-value">${server.port}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-signal"></i>
                    <span class="info-label">Ping:</span>
                    <span class="info-value">${server.ping || 'N/A'} ms</span>
                </div>
            </div>
            <div class="server-stats">
                <div class="stat-box">
                    <i class="fas fa-users"></i>
                    <div class="player-count">
                        <div style="display: flex; justify-content: space-between;">
                            <div style="font-size: 0.9em; color: #888;">Jogadores</div>
                            <div>${server.players} / ${server.maxPlayers}</div>
                        </div>
                        <div class="player-bar">
                            <div class="player-bar-fill" style="width: ${(server.players / server.maxPlayers * 100) || 0}%"></div>
                        </div>
                    </div>
                </div>
                <div class="stat-box">
                    <i class="fas fa-signal"></i>
                    <div class="ping-meter">
                        <div class="ping-bars">
                            ${getPingBars(server.ping)}
                        </div>
                        <div class="ping-text">${server.ping || 'N/A'} ms</div>
                    </div>
                </div>
                <div class="stat-box">
                    <i class="fas fa-user-group"></i>
                    <div>
                        <div style="font-size: 0.9em; color: #888;">Online</div>
                        <div style="word-break: break-word;">${server.playerNames || 'Nenhum jogador'}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="server-actions">
            <button class="btn-danger" onclick="removeServer('${server.ip}', ${server.port}, '${server.gameType}')">
                <i class="fas fa-trash"></i>
                Remover Servidor
            </button>
        </div>
    `;
    return card;
}

function getPingBars(ping) {
    let bars = '';
    const heights = ['60%', '75%', '90%', '100%'];
    for (let i = 0; i < 4; i++) {
        const active = ping && ping <= (i + 1) * 100 ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)';
        bars += `<div class="ping-bar" style="height: ${heights[i]}; background: ${active}"></div>`;
    }
    return bars;
}

async function loadServers(page = 1) {
    try {
        // Reseta a página atual se estiver recarregando a lista
        if (page === 1) {
            currentPage = 1;
            serverList.innerHTML = ''; // Limpa lista apenas na primeira página
        }
        
        // Adiciona um parâmetro de timestamp para evitar cache
        const timestamp = new Date().getTime();
        const response = await fetch(`/servers?t=${timestamp}`);
        const data = await response.json();
        
        updateTotalStats(data.servers);
        
        const start = (page - 1) * SERVERS_PER_PAGE;
        const end = start + SERVERS_PER_PAGE;
        const serversToShow = data.servers.slice(start, end);
        
        // Remove o observador antigo se existir
        if (window.currentObserver) {
            window.currentObserver.disconnect();
        }
        
        serversToShow.forEach(server => {
            const serverCard = createServerCard(server);
            serverList.appendChild(serverCard);
        });

        // Configurar observador para infinite scroll
        setupInfiniteScroll();
        
        // Atualiza a contagem total de servidores
        const totalServersElement = document.getElementById('totalServers');
        if (totalServersElement) {
            totalServersElement.textContent = data.servers.length;
        }
    } catch (error) {
        console.error('Erro ao carregar servidores:', error);
        showNotification('Erro ao carregar servidores.', 'error');
    }
}

function updateTotalStats(servers) {
    const totalServers = servers.length;
    const onlineServers = servers.filter(s => s.online).length;
    const totalPlayers = servers.reduce((sum, s) => sum + (parseInt(s.players) || 0), 0);
    
    document.getElementById('totalServers').textContent = totalServers;
    document.getElementById('onlineServers').textContent = onlineServers;
    document.getElementById('totalPlayers').textContent = totalPlayers;
}

// Infinite Scroll
function setupInfiniteScroll() {
    // Desconecta o observador anterior se existir
    if (window.currentObserver) {
        window.currentObserver.disconnect();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                currentPage++;
                loadServers(currentPage);
            }
        });
    }, {
        threshold: 0.1
    });

    const lastServerCard = document.querySelector('.server-card:last-child');
    if (lastServerCard) {
        observer.observe(lastServerCard);
        window.currentObserver = observer;
    }
}

// Função para apenas atualizar os dados dos servidores existentes
async function updateServerData() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/servers?t=${timestamp}`);
        const data = await response.json();
        
        // Atualiza as estatísticas totais
        updateTotalStats(data.servers);
        
        // Atualiza cada card de servidor existente
        const serverCards = document.querySelectorAll('.server-card');
        serverCards.forEach(card => {
            const ipElement = card.querySelector('.info-value');
            const portElement = card.querySelectorAll('.info-value')[1];
            if (!ipElement || !portElement) return;

            const ip = ipElement.textContent;
            const port = parseInt(portElement.textContent);
            
            // Encontra o servidor correspondente nos dados atualizados
            const updatedServer = data.servers.find(s => s.ip === ip && s.port === port);
            if (updatedServer) {
                // Atualiza o status online/offline
                const statusElement = card.querySelector('.server-status');
                statusElement.className = `server-status ${updatedServer.online ? 'online' : 'offline'}`;
                statusElement.innerHTML = `
                    <span class="status-icon"></span>
                    ${updatedServer.online ? 'Online' : 'Offline'}
                `;

                // Atualiza o ping
                const pingElement = card.querySelectorAll('.info-value')[2];
                if (pingElement) {
                    pingElement.textContent = `${updatedServer.ping || 'N/A'} ms`;
                }

                // Atualiza contagem de jogadores
                const playerCountElement = card.querySelector('.player-count');
                if (playerCountElement) {
                    const playerCountDiv = playerCountElement.querySelector('div > div:last-child');
                    if (playerCountDiv) {
                        playerCountDiv.textContent = `${updatedServer.players} / ${updatedServer.maxPlayers}`;
                    }
                    const playerBarFill = playerCountElement.querySelector('.player-bar-fill');
                    if (playerBarFill) {
                        playerBarFill.style.width = `${(updatedServer.players / updatedServer.maxPlayers * 100) || 0}%`;
                    }
                }

                // Atualiza medidor de ping
                const pingMeter = card.querySelector('.ping-meter');
                if (pingMeter) {
                    const pingBars = pingMeter.querySelector('.ping-bars');
                    if (pingBars) {
                        pingBars.innerHTML = getPingBars(updatedServer.ping);
                    }
                    const pingText = pingMeter.querySelector('.ping-text');
                    if (pingText) {
                        pingText.textContent = `${updatedServer.ping || 'N/A'} ms`;
                    }
                }

                // Atualiza lista de jogadores
                const playerList = card.querySelector('.stat-box:last-child div > div:last-child');
                if (playerList) {
                    playerList.textContent = updatedServer.playerNames || 'Nenhum jogador';
                }
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar dados dos servidores:', error);
    }
}

// Função para mostrar o modal de confirmação
function showConfirmModal(message) {
    return new Promise((resolve, reject) => {
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmButton = document.getElementById('confirmAction');
        const cancelButton = document.getElementById('cancelConfirm');

        confirmMessage.textContent = message;
        modal.style.display = 'block';

        const handleConfirm = () => {
            modal.style.display = 'none';
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            modal.style.display = 'none';
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmButton.removeEventListener('click', handleConfirm);
            cancelButton.removeEventListener('click', handleCancel);
        };

        confirmButton.addEventListener('click', handleConfirm);
        cancelButton.addEventListener('click', handleCancel);
    });
}

// Função de remoção de servidor
async function removeServer(ip, port, gameType) {
    try {
        const confirmed = await showConfirmModal(`Tem certeza que deseja remover o servidor ${ip}:${port}?`);
        if (!confirmed) {
            return;
        }

        const credentials = await showLoginModal();
        const users = await carregarCredenciais();
        const user = users.find(u => u.username === credentials.username && u.password === credentials.password);

        if (!user) {
            showNotification('Usuário ou senha inválidos!', 'error');
            return;
        }

        const response = await fetch('/remove-server', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip, port })
        });

        if (response.ok) {
            showNotification('Servidor removido com sucesso!', 'success', gameType);
            
            // Recarrega a lista completa
            currentPage = 1;
            serverList.innerHTML = '';
            const timestamp = new Date().getTime();
            const serversResponse = await fetch(`/servers?t=${timestamp}`);
            const data = await serversResponse.json();
            
            // Atualiza as estatísticas
            updateTotalStats(data.servers);
            
            // Recarrega os servidores na página atual
            const start = 0;
            const end = SERVERS_PER_PAGE;
            const serversToShow = data.servers.slice(start, end);
            
            serversToShow.forEach(server => {
                const serverCard = createServerCard(server);
                serverList.appendChild(serverCard);
            });
            
            // Configura o infinite scroll novamente
            setupInfiniteScroll();
        } else {
            showNotification('Erro ao remover servidor.', 'warning', gameType);
        }
    } catch (error) {
        if (error.message !== 'Login cancelado') {
            showNotification('Erro ao realizar operação.', 'error');
        }
    }
}

// Exportar todas as funções necessárias
window.loadServers = loadServers;
window.removeServer = removeServer;
window.updateServerData = updateServerData;
window.createServerCard = createServerCard;
window.updateTotalStats = updateTotalStats;
window.setupInfiniteScroll = setupInfiniteScroll;
window.showConfirmModal = showConfirmModal; 